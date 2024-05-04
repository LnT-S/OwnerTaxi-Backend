import ActiveBooking from "../models/ActiveBooking.js";
import PassiveBooking from "../models/PassiveBooking.js";
import Authentication from "../models/Authentication.js"

export const getIntercityBookingFromCustomer = async (req,res)=>{
    console.log("API : /driver/get-intercity-bookings-post-customer",req.user);

    let bookingList = await PassiveBooking.find({
       $or : [{ status : "pending"},{ status : "accepted"}],
       $or : [{ bookingType : "intercity"},{ bookingType : "sharing"}]
    })

    return res.status(200).json({
        message : 'INTERCITY BOOOKING FROM CUSTOMER',
        data : bookingList
    })
}