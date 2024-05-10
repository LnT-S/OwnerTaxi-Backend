import mongoose from 'mongoose'

const activeBookingSchema = new mongoose.Schema({
    authenticationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Authentication'
    },
    passiveBookingId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'PassiveBooking'
    },
    driverResponse : [
        {
            bookingPostedBy : {
                type: String
            },
            driverPhone : {
                type : String
            },
            driverId : {
                type : String
            },
            budget : {
                type : Number
            },
            rating : {
                type : Number,
            }
        }
    ]
},{
    timestamps : true
})

const ActiveBooking = mongoose.model('ActiveBooking',activeBookingSchema)
export default ActiveBooking