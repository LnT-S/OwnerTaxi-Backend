import express from 'express'
const router = express.Router()
import passport from 'passport'
import { deleteAccount, getOtp , verifyOtp } from '../../controllers/AuthenticationController.js'

router.post('/get-otp',getOtp)
router.post('/verify-otp',verifyOtp)
router.get('/delete-account',passport.authenticate('jwt',{session : false}),deleteAccount)

export default router