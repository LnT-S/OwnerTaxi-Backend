import ActiveBooking from '../models/ActiveBooking.js'
import PassiveBooking from '../models/PassiveBooking.js';
import Authentication from '../models/Authentication.js';


export const booking = async (req, res) => {
    console.log('API : /driver/booking \n', req.user ,'\n',req.body )
    try {
        let previousBooking = await PassiveBooking.find({ id: req.user._id })
        console.log('>>',previousBooking)
        if (previousBooking.length >= 3) {
            console.log("BOOKING LIMIT REACHED")
            return res.status(400).json({
                message: 'Your booking limit has been reached !'
            })
        }
        let psvBooking = await PassiveBooking.create({ id: req.user._id, ...req.body, status: "pending" })
        await ActiveBooking.create({ authenticationId: req.user._id, passiveBookingId: psvBooking._id })
        return res.status(200).json({
            message: 'Your booking has been confirmed !'
        })
    } catch (error) {
        console.log('ERROR CREATING BOOKING',error)
        return res.status(400).json({
            message: 'Internal Server Error'
        })
    }
}

export const getLocalBooking = async (req,res)=>{
    console.log("API : /driver/get-local-bookings",req.user);

    let bookings = await ActiveBooking.find().populate({
        path : "passiveBookingId",
        select : 'pickUp drop budget bookingType bookingSubType status acceptor _id',
        match :{status : {$in : ['pending', 'bidstarted']} , bookingType : "local"}
    })

    let data = bookings.filter((el, i)=>{
        if(el.passiveBookingId!==null)return true ; else return false
    })
      console.log("***" , data)


    return res.status(200).json({
        message : 'LOCAL BOOOKING FROM CUSTOMER AND DRIVER',
        data : data
    })
}
export const getIntercityBookingFromPostVendor = async (req,res)=>{
    console,log("API : /driver/get-intercity-bookings-post-vendor",req.user);
    return res.status(200).json({
        message : 'INTERCITY BOOOKING FROM VENDOR',
        data : []
    })
}