import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

const localDBUrl = "mongodb://127.0.0.1/owner_taxi_db"
// process.env.MONGODB_URL
mongoose.connect(process.env.MONGODB_URL)
const db = mongoose.connection

db.on('error' , console.error.bind(console , `ERROR CONNECTING TO ${localDBUrl}`))
db.once('open', ()=>console.log(`SUUCESSFULLY CONNECTED TO ${localDBUrl}`))

export default db