import { userModel } from '../../database/index.js'
import { ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '../../common/utils/response/index.js'
import { ProviderEnums } from '../../common/index.js'
import { findOne, findById, findOneAndDelete, findOneAndUpdate } from '../../database/database.service.js'
import { generateHash, compareHash } from '../../common/hash/hash.js'
import jwt from 'jsonwebtoken'
import { env } from '../../../config/index.js'
import { generateToken, decodedRefreshToken } from '../../common/security/security.js'
import { set, get } from '../../database/redis.service.js'
import { sendEmail } from '../../common/utils/email/sendEmail.js'
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
    // 2FA check
    // If 2FA enabled → generate OTP, store in Redis, send to email, and ask user to verify OTP before completing login
    if (existingUser.twoFactorEnabled) {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        // Store the OTP in Redis with a TTL of 5 minutes
        await set({ key: `login2fa:${existingUser._id}`, value: otp, ttl: 300 })
// Send OTP to email
        await sendEmail({
            to: existingUser.email,
            subject: "Login Verification OTP",
            html: `<p>Your login OTP is: <b>${otp}</b>. It expires in 5 minutes.</p>`
        })
        // Return response indicating that OTP has been sent and 2FA verification is required
        return {
            message: "OTP sent to your email. Please verify to complete login",
            twoFactor: true,
            userId: existingUser._id
        }
    }
    // 2FA disabled → generate tokens

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






//  2-step-verification :
// • Implement a 2-step-verification enabling endpoint:
// • If a user wants to enable 2 step verification on his account, he will call this endpoint while logged in then an OTP will be sent to his account.
// • With that OTP he needs to send it to another endpoint to verify that OTP and enable the 2-step-verification on his account

//first endpoint to request OTP and send it to email then second endpoint to verify OTP and enable 2FA on user account
export const request2FA = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const userEmail = user.email; //email of the user to send OTP


        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store the OTP in Redis with a TTL of 5 minutes
        await set({ key: `2fa:${userId}`, value: otp, ttl: 300 });

        // Send OTP to email
        await sendEmail({
            to: userEmail,
            subject: "Your 2-Step Verification OTP",
            html: `<p>Your OTP code is: <b>${otp}</b>. It expires in 5 minutes.</p>`
        });


        res.status(200).json({ message: "OTP sent to your email. Please verify to enable 2FA." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to generate OTP" });
    }
};

// Endpoint to verify OTP and enable 2FA
export const verify2FA = async (req, res) => {
    try {

        const userId = req.userId;
        const { otp } = req.body;
        // Get the stored OTP from Redis
        const storedOTP = await get(`2fa:${userId}`);
        if (!storedOTP) return res.status(400).json({ message: "OTP expired or not found" });
        if (otp !== storedOTP) return res.status(400).json({ message: "Invalid OTP" });

        // Enable 2FA on user account
        await userModel.findByIdAndUpdate(userId, { twoFactorEnabled: true });

        // Delete OTP from Redis after enabling 2FA
        await del(`2fa:${userId}`);

        res.status(200).json({ message: "2FA enabled successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to verify OTP" });
    }
};


export const confirmLogin2FA = async ({ userId, otp }) => {
    // Get the stored OTP from Redis
    const storedOTP = await get(`login2fa:${userId}`)
    // If OTP not found or expired
    if (!storedOTP) throw new Error("OTP expired or not found")
        // If OTP does not match
    if (otp !== storedOTP) throw new Error("Invalid OTP")
// OTP is valid → generate tokens and remove OTP from Redis
    await del(`login2fa:${userId}`)
    // Get user data to generate tokens
    const user = await userModel.findById(userId)
    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateToken(user)

    return { accessToken, refreshToken }
}