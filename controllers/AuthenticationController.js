import twilio from 'twilio'
export const getOtp = async function(req,res){
    console.log('API :  /authentication/get-otp' , req.body)

    const accountSid = 'AC998b07eb90180db3a91e0a5807dfd318'
    const authToken = 'a7447561607c1ebc98f838736394ade6'

    const client = twilio(accountSid , authToken);

    const message = await client.messages.create({
        body : 'Your OTP for login is    ',
        from : '+17206136198',
        to : '+918303024282'
    })

    console.log('MESSAGE SID' , message)

    return res.status(200).json({
        message : 'OTP sent successfully'
    })
}