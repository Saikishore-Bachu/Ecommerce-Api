const mongoose = require('mongoose')
const db = process.env.MONGO_URL

const connectDatabase = () => {
  mongoose
    .connect(db, {
      useNewUrlParser: true,
    })
    .then((data) => {
      console.log(`mongodb conncted with server: ${data.connection.host} `)
    })
}

module.exports = connectDatabase
