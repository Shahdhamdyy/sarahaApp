import { Router } from 'express'
import { signUp, getUseById, Login ,generateAccessToken} from './auth.service.js'
import { SuccessResponse } from '../../common/utils/response/index.js'
import { auth } from '../../common/middleware/auth.js'
import { signUpSchema ,loginSchema} from './auth.validation.js'
import { BadRequestException } from '../../common/utils/response/index.js'
import {validation} from '../../common/utils/validation.js'
const router = Router()

router.post('/signUp',validation(signUpSchema), async (req, res) => {
   
    let addedUser = await signUp(req.body)
    SuccessResponse({ res, message: "User Added Successfully", status: 201, data: addedUser })

})
router.post('/Login', validation(loginSchema),async (req, res) => {
    // let loginUser = await Login(req.body,`${req.protocol}://${req.host}`)
    let loginUser = await Login(req.body)

    SuccessResponse({ res, message: "User Login Successfully", status: 201, data: loginUser })

})
router.get('/get-user-by-id',auth, async (req, res) => {
    let userData = await getUseById(req.userId)
    SuccessResponse({ res, message: "User Data", status: 201, data: userData })

})
router.get("/generate-access-token",async(req,res)=>{
    let {authorization}=req.headers
    let accessToken =await generateAccessToken(authorization)
 return  SuccessResponse({ res, message: "Access Token", status: 201, data: accessToken }
    )
})
export default router
