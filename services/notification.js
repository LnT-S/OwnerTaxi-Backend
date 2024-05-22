import dotenv from 'dotenv'
dotenv.config()
import axios from 'axios'

export const sendNotification = async (channelId , userArray , title , description)=>{
    console.log("NOTIFICATION",channelId , userArray , title , description);
    try {
        const notification = {
            app_id: process.env.ONESIGNAL_APP_ID,
            headings : {en : title},
            contents: { en: description },
            isAndroid: true,
            include_subscription_ids: userArray,
            // existing_android_channel_id : '6c3e7417-f4e9-4186-982f-b7edaa60e035',
            android_channel_id : channelId
        };
        axios.post('https://api.onesignal.com/notifications', notification, {
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${process.env.ONESIGNAL_APP_KEY}`
            }
        }).then((response) => {
            return {
                status : 200,
                message: "RESPONSE FROM NNOTIFICAION",
                data: response.data
            }
        }).catch((error) => {
            console.log("ERROR CALLING NOTIFICATION data -----", error);
            return {
                status : 200,
                message : "Internal Server Error"
            }
        });
    } catch (error) {
        console.log("ERROR CALLING NOTIFICATION data -----", error);
        return {
            message : "Internal Server Error"
        }
    }
}