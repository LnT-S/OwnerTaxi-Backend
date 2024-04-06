import express from 'express'
const router = express.Router()

import { getOtp } from '../../controllers/AuthenticationController.js'

router.post('/get-otp',getOtp)

export default router