import mongoose from 'mongoose'

const activeBookingSchema = new mongoose.Schema({
    authenticationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Authentication'
    },
    passiveBookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PassiveBooking'
    },
    driverResponse: [
        {
            bookingPostedBy: {
                type: String
            },
            driverPhone: {
                type: String
            },
            driverId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Authentication'
            },
            budget: {
                type: Number
            },
            rating: {
                type: Number,
            },
            name: {
                type: String
            },
            image: {
                type: String
            }
        }
    ]
}, {
    timestamps: true
})

const ActiveBooking = mongoose.model('ActiveBooking', activeBookingSchema)
export default ActiveBooking