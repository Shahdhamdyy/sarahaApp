import { Router } from 'express'
import { auth } from '../../common/middleware/auth.js'
import { SuccessResponse } from '../../common/utils/response/index.js'
import { getUserProfile, shareProfileLink, updateUserProfile, getUserData, deleteUser } from './user.service.js'
import { multer_local } from '../../common/middleware/multer.js'

const router = Router()

router.get('/get-user-profile', auth, async (req, res) => {
  let userProfile = await getUserProfile(req.userId)
  SuccessResponse({ res, message: "User Profile retrieved successfully", status: 201, data: userProfile })

})

router.get('/get-url-profile', auth, async (req, res) => {
  let profileURL = await shareProfileLink(req.userId)
  SuccessResponse({ res, message: "Profile URL retrieved successfully", status: 201, data: profileURL })
})

router.get('/get-user-data', async (req, res) => {
  let userData = await getUserData(req.body)
  SuccessResponse({ res, message: "User Data retrieved successfully", status: 201, data: userData })
})
//update image too
router.put('/update-user-profile', multer_local({ customPath: "users/images" }).single('image'), auth, async (req, res) => {

  console.log("BODY:", req.body)
  console.log("FILE:", req.file)
  let updatedProfile = await updateUserProfile(req.userId, req.body, req.file)
  SuccessResponse({ res, message: "User Profile updated successfully", status: 200, data: updatedProfile })
})

router.delete('/delete-user', auth, async (req, res) => {
  let deletedUser = await deleteUser(req.userId)
  SuccessResponse({ res, message: "USER DELETED", status: 200, data: deletedUser })
})
export default router;