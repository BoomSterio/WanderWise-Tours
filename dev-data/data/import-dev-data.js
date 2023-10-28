const fs = require('fs')
const mongoose = require('mongoose')
require('dotenv').config({ path: `${__dirname}./../../.env` })
const Tour = require('../../models/tour')

const db = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.tkcxdql.mongodb.net/natours?retryWrites=true&w=majority`
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('\x1b[36m%s\x1b[0m', '✔ MongoDB connected successfully!'))

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'))

// Import data into DB
const importData = async () => {
  try {
    await Tour.create(tours)
    console.log('Data was imported successfully!')
  } catch (err) {
    console.log(err)
  } finally {
    process.exit()
  }
}

// Delete all data from DB
const deleteAllData = async () => {
  try {
    await Tour.deleteMany()
    console.log('Data was deleted successfully!')
  } catch (err) {
    console.log(err)
  } finally {
    process.exit()
  }
}

if (process.argv.includes('--import')) {
  importData()
  return
}

if (process.argv.includes('--delete')) {
  deleteAllData()
  return
}

console.log('No argument reveived.\nUse either --import (to seed the db) or --delete (to delete all the data from db)')
process.exit()
