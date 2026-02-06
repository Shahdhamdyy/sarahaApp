import { Router } from 'express'
import { signUp ,Login} from './auth.service.js'
import { SuccessResponse } from '../../common/utils/response/index.js'
const router = Router()

router.post('/signUp', async (req, res) => {
    let addedUser = await signUp(req.body)
    SuccessResponse({ res, message: "User Added Successfully", status: 201, data: addedUser })

})
router.post('/Login', async (req, res) => {
    let loginUser = await Login(req.body)
    SuccessResponse({ res, message: "User Login Successfully", status: 201, data: loginUser })

})
export default router
