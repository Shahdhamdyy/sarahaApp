import { Router } from 'express'
import { signUp, getALLData, Login } from './auth.service.js'
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
router.get('/getALLData', async (req, res) => {
    let userData = await getALLData(req.headers)
    SuccessResponse({ res, message: "User Data", status: 201, data: userData })

})
export default router
