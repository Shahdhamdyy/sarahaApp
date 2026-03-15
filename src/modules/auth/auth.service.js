import { userModel } from '../../database/index.js'
import { ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '../../common/utils/response/index.js'
import { ProviderEnums } from '../../common/index.js'
import { findOne, findById, findOneAndDelete, findOneAndUpdate } from '../../database/database.service.js'
import { generateHash, compareHash } from '../../common/hash/hash.js'
import jwt from 'jsonwebtoken'
import { env } from '../../../config/index.js'
import { generateToken, decodedRefreshToken } from '../../common/security/security.js'
import { set, get } from '../../database/redis.service.js'
// import { sendEmail } from '../../common/utils/email/sendEmail.js'
import { event } from '../../common/utils/email/email.events.js'
import { incr, ttl, del } from '../../database/redis.service.js'
export const signUp = async (data, file) => {
    const { userName, email, password, sharedProfileName } = data
    const existingUser = await findOne({
        model: userModel,
        filter: { email }
    })
    if (existingUser) {
        ConflictException("User already exists")
    }
    let image = ""

    if (file) {
        image = `${env.BASE_URL}/uploads/users/profileImages/${file.filename}`
    }
    console.log("file")
    const hashedPassword = await generateHash(password)
    const addedUser = await userModel.create({
        userName,
        email,
        password: hashedPassword,
        profileImage: image,
        sharedProfileName
    })
    console.log("addedUser")

    event.emit("verifyEmail", {
        userId: addedUser._id,
        email,
        userName
    })
    const user = addedUser.toObject()
    delete user.password

    return user
}


export const verifyEmail = async ({ code, email }) => {

    let user = await findOne({
        model: userModel,
        filter: { email }
    })

    if (!user) {
        NotFoundException({ message: "User Not Found" })
    }

    const redisCode = await get(`otp::${user._id}`)

    if (!redisCode) {
        BadRequestException({ message: "OTP expired or not found" })
    }

    const isMatch = await compareHash(String(code), redisCode)

    if (!isMatch) {
        BadRequestException({ message: "Invalid Code" })
    }

    user = await findOneAndUpdate({
        model: userModel,
        filter: { _id: user._id },
        update: { isVerified: true },
        options: { new: true }
    })

    return user
}

export const Login = async (data, host) => {
    let { email, password } = data
    //account ban or failed attempts
    // Redis key for this user
    const attemptsKey = `loginAttempts:${email}`
    // check if attempts exist
    const attempts = await get(attemptsKey)
    // if attempts reached 5 → user is banned
    if (attempts && attempts >= 5) {
        throw new Error("Account temporarily banned. Try again after 5 minutes.")
    }


    let existingUser = await findOne({ model: userModel, filter: { email, provider: ProviderEnums.System } })
    if (!existingUser) {
        throw new Error("User Not Found")
    }

    const isMatched = await compareHash(password, existingUser.password)
    if (!isMatched) {

        const failedAttempts = await incr(attemptsKey)

        // if attempts reached 5  ban for 5 minutes
        if (failedAttempts === 5) {
            await ttl(attemptsKey, 300) // 5 minutes
            throw new Error("Account banned for 5 minutes due to multiple failed attempts")
        }

        throw new Error(`Wrong password. Attempt ${failedAttempts} of 5`)
    }

    //  login success -->remove attempts
    await del(attemptsKey)

    let { accessToken, refreshToken } = generateToken(existingUser)

    return { existingUser, accessToken, refreshToken }
}
/*
exp  (expiresIn)  → When the token expires
iat  (issued at)  → When the token was created
nbf  (not before) → When the token becomes valid
iss  (issuer)     → Who issued the token
aud  (audience)   → Who the token is intended for
sub  (subject)    → The owner of the token (usually user ID)
*/


export const getUseById = async (userId) => {

    let userData = await findById({ model: userModel, id: userId })
    return userData
}


export const generateAccessToken = (token) => {
    let decodedData = decodedRefreshToken(token)
    let signature = undefined
    switch (decodedData.aud) {
        case "Admin":
            signature = env.adminSignature
            break;
        default:
            signature = env.userSignature
            break

    }
    let accessToken = jwt.sign({ id: decodedData.id }, signature, {
        audience: decodedData.aud,
        expiresIn: "1h"

    })
    return accessToken


}

export const getProfileById = async (profileId, viewerId) => {
    //if i opened my profile i dont want to increase view count but if i opened other profile i want to increase view count by 1
    if (profileId !== viewerId) {
        await userModel.findByIdAndUpdate(profileId, { $inc: { viewCount: 1 } })
    }
    //i want to open profile data without password
    const user = await userModel.findById(profileId).select("-password")
    //if user not found with this id i will return USER NOT FOUND
    if (!user) {
        NotFoundException({ message: "User Not Found" })
    }

    return user
}





export const Logout = async (req) => {
    let redisKey = createRevokeKey(req)
    await set({
        key: redisKey,
        value: 1,
        ttl: req.decoded.iat + 30 * 60
    }) // i will revoke token for 30 minutes after logout because access token expire in 1 hour and i want to make sure that user cant use the same token after logout

}