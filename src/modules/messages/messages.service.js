import { messageModel } from '../../database/models/messages.js'
import { insertOne, findById, findOneAndDelete, findAll, findOne } from '../../database/database.service.js'
import { userModel } from '../../database/models/user.model.js'
import { BadRequestException } from '../../common/utils/response/index.js'
export const sendMessage = async (body, userId) => {
    console.log("USER ID:", userId)
    console.log("TYPE:", typeof userId)
    let { message, image } = body
    let existUser = await findById({ model: userModel, id: userId })
    if (!existUser) {
        BadRequestException({ message: "Invalid Receiver Id" })
    }
    let newMessage = await insertOne({
        model: messageModel,
        data: {
            message,
            image,
            receiverId: userId
        }
    })
    if (newMessage) {
        return newMessage
    }
    else {
        BadRequestException({ message: "Failed to send message" })
    }

}


export const getAllMessages = async (userId) => {
    let existUser = await findById({ model: userModel, id: userId })
    if (!existUser) {
        throw BadRequestException({ message: "Invalid user" })
    }
    let messages = await findAll({ model: messageModel, filter: { receiverId: userId } })
    if (!messages.length) {
        throw BadRequestException({ message: "No messages found" })
    }
    return messages



}


export const getMessageById = async (messageId, userId) => {
    console.log("messageId:", messageId)
    console.log("userId:", userId)

    let message = await findOne({ model: messageModel, filter: { _id: messageId, receiverId: userId } })
    if (!message) {
        throw BadRequestException({ message: "Invalid message id or unauthorized access" })
    }
    return message


}
export const deleteMessageById = async (messageId, userId) => {
    let deletedMessage = await findOneAndDelete({ model: messageModel, filter: { _id: messageId, receiverId: userId } })
    if (!deletedMessage) {
        BadRequestException({ message: "Failed to delete message or unauthorized access" }) // ✅ بدون throw
    }
    return deletedMessage

}