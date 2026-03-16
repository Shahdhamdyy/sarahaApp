import { findOne, findOneAndUpdate, findOneAndDelete } from '../../database/index.js'
import { userModel } from '../../database/models/user.model.js'
import { NotFoundException } from '../../common/utils/response/index.js'
import { env } from '../../../config/index.js'
import { set, get, del } from '../../database/redis.service.js'

let genKey = (userId) => {
    return `userProfile:${userId}`
}

export const getUserProfile = async (userId) => {
    let userData = await get(genKey(userId))
    if (userData) {
        return userData
    }
    userData = await findOne({ model: userModel, filter: { _id: userId }, select: 'firstName lastName email profileImage sharedProfileName' })
    if (!userData) {
        throw NotFoundException({ message: "User Not Found" })
    } else {
        await set({
            key: genKey(userId),
            value: userData,
            ttl: 60
        })
    }
    return userData
}


export const shareProfileLink = async (userId) => {
    let userData = await findOne({ model: userModel, filter: { _id: userId }, select: '-password' })
    if (!userData) {
        throw NotFoundException({ message: "User Not Found" })
    }
    else {
        let url = `${env.BASE_URL}/${userData.sharedProfileName}`
        return url
    }
}


export const getUserData = async (data) => {
    let { sharedProfileName } = data
    let userLink = sharedProfileName.split("/")[3]
    console.log("userLink:", userLink)
    let userData = await findOne({ model: userModel, filter: { sharedProfileName: userLink }, select: 'firstName lastName  email' })
    console.log("userData:", userData)
    if (!userData) {
        throw NotFoundException({ message: "User Not Found" })
    }
    return userData
}
export const updateUserProfile = async (userId, data, file) => {

    console.log("USER ID:", userId)
    console.log("DATA:", data)

    let updateData = { ...data }

    if (file) {
        updateData.profileImage = `${env.BASE_URL}/uploads/${file.filename}`
    }

    const updatedUser = await findOneAndUpdate({
        model: userModel,
        filter: { _id: userId },
        update: updateData,
        options: { new: true }
    })

    if (!updatedUser) {
        throw new Error("User not found")
    }

    await del(genKey(userId))

    return updatedUser
}
export const deleteUser = async (userId) => {
    let data = await findOneAndDelete({ model: userModel, filter: { _id: userId } })
    if (!data) {
        throw NotFoundException({ message: "User Not Found" })
    }
    return data


}