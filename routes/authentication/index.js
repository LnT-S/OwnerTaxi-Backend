import express from 'express'
const router = express.Router()
import passport from 'passport'
import { deleteAccount, deleteAccountLink, getOtp , updateSubscription, verifyOtp } from '../../controllers/AuthenticationController.js'
import { jwtAuthMiddleware } from '../../middlewares/jwtAuthCheck.js'

router.post('/get-otp',getOtp)
router.post('/verify-otp',verifyOtp)
router.get('/delete-account',passport.authenticate('jwt',{session : false}),deleteAccount)
router.post('/update-subscription',jwtAuthMiddleware,updateSubscription)
router.get('/request-to-delete',deleteAccountLink)

export default router