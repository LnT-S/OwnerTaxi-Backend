import express from 'express'
import { activeBookingInfo, booking, editProfileInfo, getProfileInfo } from '../../controllers/CustomerController.js'

const router = express.Router()

router.post('/booking',booking)
router.get('/active-booking-info',activeBookingInfo)
router.get('/get-profile-info',getProfileInfo)
router.post('/edit-profile-info',editProfileInfo)

export default router