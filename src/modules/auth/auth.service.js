import { userModel } from '../../database/index.js'
import { ConflictException, NotFoundException } from '../../common/utils/response/index.js'
import { ProviderEnums } from '../../common/index.js'
import { findOne } from '../../database/database.service.js'
export const signUp = async (data) => {
    let { userName, email, password } = data
    let existingUser = await findOne({ model: userModel, filter: { email } })
    if (existingUser) {
        return ConflictException({ message: "user Already Exists" })
    }
    let addedUser = await userModel.insertOne({ userName, email, password })
    return addedUser

}
export const Login = async (data) => {
    let { email, password } = data
    let existingUser = await findOne({ model: userModel, filter: { email, password, provider: ProviderEnums.System } })
    if (existingUser) {
        return existingUser
    }

    return NotFoundException({ message: "User Not Found" })
}



