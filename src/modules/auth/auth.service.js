import { userModel } from '../../database/index.js'
import { ConflictException, NotFoundException, UnauthorizedException } from '../../common/utils/response/index.js'
import { ProviderEnums } from '../../common/index.js'
import { findOne, findById } from '../../database/database.service.js'
import { generateHash, compareHash } from '../../common/hash/hash.js'
import jwt from 'jsonwebtoken'


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
export const Login = async (data) => {
    let { email, password } = data
    let existingUser = await findOne({ model: userModel, filter: { email, provider: ProviderEnums.System } })
    console.log(existingUser);
    if (existingUser) {
        const isMatched = await compareHash(password, existingUser.password)
        if (isMatched) {
            let token = jwt.sign({ id: existingUser._id }, "route", { expiresIn: '1h' })
            return { existingUser, token }
        }
    }

    return NotFoundException({ message: "User Not Found" })
}

export const getALLData = async (headers) => {
    let { authorization } = headers
    if (!authorization) {
        UnauthorizedException({ message: "Unauthorized" })
    }
    let decodedToken = jwt.verify(authorization, "route")
    console.log(decodedToken);
    let userData = await findById({ model: userModel, id: decodedToken.id })
    return userData


}


