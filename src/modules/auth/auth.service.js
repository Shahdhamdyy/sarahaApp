import { userModel } from '../../database/index.js'
import { ConflictException, NotFoundException, UnauthorizedException } from '../../common/utils/response/index.js'
import { ProviderEnums } from '../../common/index.js'
import { findOne, findById } from '../../database/database.service.js'
import { generateHash, compareHash } from '../../common/hash/hash.js'
import jwt from 'jsonwebtoken'
import { env } from '../../../config/index.js'
import { generateToken, decodedRefreshToken } from '../../common/security/security.js'

export const signUp = async (data) => {
    let { userName, email, password } = data
    let existingUser = await findOne({ model: userModel, filter: { email } })
    if (existingUser) {
        return ConflictException({ message: "user Already Exists" })
    }
    let hashedPassword = await generateHash(password)
    let addedUser = await userModel.insertOne({ userName, email, password: hashedPassword })
    return addedUser

}
export const Login = async (data, host) => {
    let { email, password } = data
    let existingUser = await findOne({ model: userModel, filter: { email, provider: ProviderEnums.System } })
    console.log(existingUser);
    if (existingUser) {
        let { accessToken, refreshToken } = generateToken(existingUser)
        const isMatched = await compareHash(password, existingUser.password)
        if (isMatched) {
            return { existingUser, accessToken, refreshToken }
        }
    }
    return NotFoundException({ message: "User Not Found" })
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