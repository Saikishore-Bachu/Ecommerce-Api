const express = require('express')

const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const errorMiddleware = require('./middleware/error')
app.use(express.json())
app.use(cookieParser())
app.use(cors())

//ROute imports
const product = require('./routes/productsRoute')
const user = require('./routes/userRoutes')
const order = require('./routes/orderRoutes')

app.use('/api/v1', product)
app.use('/api/v1', user)
app.use('/api/v1', order)

//middleware for Errors

app.use(errorMiddleware)
module.exports = app
