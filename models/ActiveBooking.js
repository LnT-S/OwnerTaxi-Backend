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
            driverPhone : {
                type : Number
            },
            driverId : {
                type : Number
            },
            budget : {
                type : Number
            },
            rating : {
                type : Number,
                validator : {
                    validate : function(value){
                        return value >=0 && value <=5
                    },
                    message : 'Rating should greater than zero and less than 5 inclusively'
                }
            }
        }
    ]
},{
    timestamps : true
})

const ActiveBooking = mongoose.model('ActiveBooking',activeBookingSchema)
export default ActiveBooking