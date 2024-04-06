import twilio from 'twilio'
export const getOtp = async function(req,res){
    console.log('API :  /authentication/get-otp' , req.body)

    return res.status(200).json({
        message : 'OTP sent successfully'
    })
}