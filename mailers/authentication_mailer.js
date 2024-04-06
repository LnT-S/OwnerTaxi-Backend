import { transporter , renderTemplate } from "../config/nodemailer.js";
{/*
data = {
    userEmail : '',
    otp : ''
}
 */}
const signInOtpMailer = function(data){
    const mailHtml = renderTemplate({otp : data.otp} , "/authentication_mailer.ejs");
    // console.log(mailHtml)
    const mailOption = {
        from : 'admin@ownertaxi.com',
        to : data.userEmail,
        subject : 'OTP for loggin in to the Owner Taxi Application',
        html : mailHtml
    }
    transporter.sendMail(mailOption , function(err , info){
        if(err){
            console.log('ERROR SENDING MAIL ',err);
            return;
        }
        console.log("EMAIL SENT SUCCESSFULLY ",info.response)
    })
}

export default signInOtpMailer