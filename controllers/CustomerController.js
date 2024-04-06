import signInOtpMailer from "../mailers/authentication_mailer.js"

export const booking =(req,res)=>{
    console.log('API : /customer/booking \n',req,req.body)

    // signInOtpMailer({userEmail : 'srivastavaudit23@gmail.com' , otp : 2456})

    return res.status(200).json({
        message : 'Your booking has been confirmed !'
    })
}