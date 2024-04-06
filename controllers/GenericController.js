import Authentication from "../models/Authentication.js"

export const vehicleInfo = async(req,res)=>{
    console.log('API : /vehicle-info')

    const vehicleInfo = await Authentication.find({
        type : {
            $in : ['driver' , 'vendor' , 'superAdmin']
        }
    },{vehicle : 1 , _id : 1})

    return res.status(200).json({
        message : 'VEHICLE INFORMATION',
        data : vehicleInfo
    })
}