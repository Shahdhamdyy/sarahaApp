import { Router } from 'express'
import { sendMessage,getAllMessages,deleteMessageById ,getMessageById} from './messages.service.js'
import { SuccessResponse } from '../../common/utils/response/index.js'
import { validation } from '../../common/utils/validation.js'
import { sendMessageSchema } from './messages.validation.js'
import { auth } from '../../common/middleware/auth.js'
const router = Router()



router.post('/send-message/:receiverId', validation(sendMessageSchema),async (req, res) => {

    let data = await sendMessage(req.body, req.params.receiverId)
    SuccessResponse({ res, message: "Message Sent Successfully", status: 201, data })
})
router.get('/get-all-messages',auth,async(req, res) => {
let messages = await getAllMessages(req.userId)
SuccessResponse({ res, message: "Messages retrieved successfully", status: 200, data: messages })
})


router.get('/get-message-by-id/:messageId',auth, async (req, res) => {
let data =await getMessageById(req.params.messageId,req.userId)
SuccessResponse({ res, message: "Message retrieved successfully", status: 200, data:data })
})
router.delete('/delete-message-by-id/:messageId',auth, async (req, res) => {
    let deletedMessage = await deleteMessageById(req.params.messageId, req.userId)
    // Implement delete message functionality here
    SuccessResponse({ res, message: "Message deleted successfully", status: 200 })
})
export default router