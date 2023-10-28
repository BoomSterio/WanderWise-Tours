const mongoose = require('mongoose')
require('dotenv').config()

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message)
  console.log('\x1b[31m%s\x1b[0m', '💥 UNCAUGHT EXCEPTION! Shutting down...')
  process.exit(1)
})

const app = require('./app')

const db = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.tkcxdql.mongodb.net/natours?retryWrites=true&w=majority`
console.log('\x1b[32m%s\x1b[0m', '⏳ Establishing connection with MongoDB...')
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('\x1b[36m%s\x1b[0m', '✔ MongoDB connected successfully!'))

const port = process.env.PORT || 8000
const server = app.listen(port, () => {
  console.log('\x1b[36m%s\x1b[0m', `✔ Listening on port ${port}. Env: ${process.env.NODE_ENV}`)
})

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message)
  console.log('\x1b[31m%s\x1b[0m', '💥 UNHANDLED REJECTION! Shutting down...')

  // Close server before exiting the process in case there are some requests
  // from clients in progress
  server.close(() => {
    // Shut down application immediately after server successfully closed (optional)
    process.exit(1)
  })
})
