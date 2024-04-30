import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import jwt_strategy from './config/passport_jwt.js'
import cors from 'cors'
import path from 'path'
const __dirname = path.resolve(path.dirname(''));
const app = express()
const PORT = process.env.PORT || 8000

import db from './config/mongoose.js'

app.use(cors('*'))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static('./assets'))
app.use(expressLayouts)

app.set('view engine','ejs')
app.set('views',['./views'])
app.set('layout extractStyles',true)
app.set('layout extractScripts',true)
app.set('view options',{layout : true})

import expressEjsLayouts from 'express-ejs-layouts'
import routes from './routes/index.js'
app.use('/uploads', express.static(__dirname + '/uploads'))
app.use('/',routes)

try {
    app.listen(PORT, err => {
        if(err){
            console.log("ERROR CONNECTING TO PORT ",PORT)
            return
        }
        console.log('SUCCESSFULLY CONNECTED TO PORT ',PORT)
    })
} catch (error) {
    console.log("ERROR CONNECTING TO PORT ",PORT)
}