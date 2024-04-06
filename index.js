import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import cors from 'cors'
const app = express()
const PORT = 8000

import db from './config/mongoose.js'

app.use(cors('*'))
app.use(express.urlencoded())
app.use(express.static('./assets'))
app.use(expressLayouts)

app.set('view engine','ejs')
app.set('views',['./views'])
app.set('layout extractStyles',true)
app.set('layout extractScripts',true)
app.set('view options',{layout : true})

import routes from './routes/index.js'
import expressEjsLayouts from 'express-ejs-layouts'
app.use('/',routes)

app.listen(PORT, err => {
    if(err){
        console.log("ERROR CONNECTING TO PORT ",PORT)
        return
    }
    console.log('SUCCESSFULLY CONNECTED TO PORT ',PORT)
})