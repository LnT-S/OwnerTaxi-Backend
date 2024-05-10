import express from 'express'
import { acceptIntercityBooking, addVehicle, assignBooking, booking, checkWhetherAcceptedTheBooking, deleteBooking, getBookingsDriverHasAccepted, getBookingsDriverHasPosted, getDocumentInfo, getHistory, getIntercityBookingFromPostVendor, getLocalBooking, getProfileInfo, isDocumentVerified, unAssignBooking, unacceptTheBooking, uploadDocument } from '../../controllers/DriverController.js'
const router = express.Router()

router.get('/get-profile-info',getProfileInfo)
router.get('/get-local-bookings',getLocalBooking) 
router.get('/get-intercity-bookings-post-vendor',getIntercityBookingFromPostVendor) 
router.post('/booking',booking)
router.post('/add-vehicle',addVehicle)
router.get('/get-document-info',getDocumentInfo)
router.post('/upload-document',uploadDocument)
router.post('/accept-intercity-booking',acceptIntercityBooking)
router.post('/check-whether-accepted-the-booking',checkWhetherAcceptedTheBooking)
router.post('/unaccept-the-booking',unacceptTheBooking)
router.get('/get-bookings-i-have-accepted',getBookingsDriverHasAccepted)
router.get('/get-bookings-i-have-posted',getBookingsDriverHasPosted)
router.get('/is-document-verified',isDocumentVerified)
router.post('/assign-intercity-booking',assignBooking)
router.post('/un-assign-intercity-booking',unAssignBooking)
router.post('/delete-booking',deleteBooking)
router.get('/get-history',getHistory)

export default router