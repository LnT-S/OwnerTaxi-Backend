import express from 'express'
import { acceptIntercityBooking, addVehicle, assignBooking, booking, checkWhetherAcceptedTheBooking, closeBooking, deleteBooking, getBookingsDriverHasAccepted, getBookingsDriverHasPosted, getDocumentInfo, getHistory, getIntercityBookingFromPostVendor, getLocalBooking, getProfileInfo, getTransactionInfo, isDocumentVerified, payToSuperAdmin, unAssignBooking, unacceptTheBooking, uploadDocument, uprollTransaction } from '../../controllers/DriverController.js'
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
router.post('/close-booking',closeBooking)
router.post('/uproll-transaction',uprollTransaction)
router.get('/get-transaction-info',getTransactionInfo)
router.post('/pay',payToSuperAdmin)

export default router