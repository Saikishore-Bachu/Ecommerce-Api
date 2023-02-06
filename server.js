const app = require('./app')

const dotenv = require('dotenv')
//handling UnCought Exceptionm

process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`)
  console.log('shutting down the server due to uncought err')
  process.exit(1)
})
//config
dotenv.config({ path: 'backend/config/config.env' })
const connectDatabase = require('./config/database')

//connecting to database
connectDatabase()

const server = app.listen(process.env.PORT, () => {
  console.log(`server is running on http://localhost:${process.env.PORT}`)
})

// unhandled Promise Rejection

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`)
  console.log('Shutting down the server due to unhaled promise Rejection')

  server.close(() => {
    process.exit(1)
  })
})
