import { Router } from 'express'
import { signUp, getUseById, verifyEmail, getProfileById, Login, Logout, generateAccessToken } from './auth.service.js'
import { SuccessResponse } from '../../common/utils/response/index.js'
import { auth } from '../../common/middleware/auth.js'
import { signUpSchema, loginSchema } from './auth.validation.js'
// import { BadRequestException } from '../../common/utils/response/index.js'
import { validation } from '../../common/utils/validation.js'
import { multer_local } from '../../common/middleware/multer.js'
import { extensions } from '../../common/middleware/multer.js'
const router = Router()

// router.post("/test", multer_local({ customPath: "/test" }).array('images', 2), async (req, res) => {
//   let files = req.files
//   files.map((file) => {
//     file.finalPath = file.destination + "/" + file.filename
//   })
// })
// router.post("/fields", multer_local({ customPath: "/fields" }).fields([

//   { name: "cover", maxCount: 1 },
//   { name: "profile", maxCount: 2 }

// ]), async (req, res) => {
//   let files = req.files
//   files.cover.map((file) => {
//     file.finalPath = file.destination + "/" + file.filename
//   })
//   files.profile.map((file) => {
//     file.finalPath = file.destination + "/" + file.filename
//   })


//   res.status(200).json({
//     message: "success",
//     files: req.files
//   })

// })


router.post('/signUp', validation(signUpSchema), multer_local({ customPath: "users/profileImages", allowedExtensions: extensions.image }).single('profileImage'), async (req, res) => {
  console.log("ggggg")
  let addedUser = await signUp(req.body, req.file)
  console.log("addedUser")
  SuccessResponse({ res, message: "User Added Successfully", status: 201, data: addedUser })

})
router.post('/verify-email', async (req, res) => {
  let data = await verifyEmail(req.body)
  if (data) {
    SuccessResponse({ res, message: "Email Verified Successfully", status: 200, data })

  } else {
    throw new Error({ message: "Invalid Code" })
  }
})
router.post('/Login', validation(loginSchema), async (req, res) => {
  // let loginUser = await Login(req.body,`${req.protocol}://${req.host}`)
  let loginUser = await Login(req.body)

  SuccessResponse({ res, message: "User Login Successfully", status: 201, data: loginUser })

})
router.get('/get-user-by-id', auth, async (req, res) => {
  let userData = await getUseById(req.userId)
  SuccessResponse({ res, message: "User Data", status: 201, data: userData })

})
router.get("/generate-access-token", async (req, res) => {
  let { authorization } = req.headers
  let accessToken = await generateAccessToken(authorization)
  return SuccessResponse({ res, message: "Access Token", status: 201, data: accessToken }
  )
})
router.get('/profile/:userId', auth, async (req, res, next) => {
  try {
    //req.params.userId da id profile i want to open 
    //req.userId login user
    const data = await getProfileById(req.params.userId, req.userId)
    SuccessResponse({ res, message: "Profile Data", status: 200, data })
  } catch (err) {
    next(err)
  }
})

router.post('/logout', auth, async (req, res) => {
  let logout = await Logout(req)
  return SuccessResponse({ res, message: "Logout Successfully", status: 200 })
})


export default router
