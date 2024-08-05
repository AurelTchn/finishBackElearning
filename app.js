require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const routes = require('./routes')
const cors = require('cors')
const app = express()

app.use(cors())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* const Fedapay = require('fedapay')

Fedapay.apiKey = 'sk_sandbox_8PrtX-zqWSmhDBjYMde0Qhwj' */

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', routes)


const port = 8080
function listening(){
    console.log(`run on port : ${port} url : http://localhost:${port}`)
}
app.listen(port, listening)