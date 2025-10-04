const mongoose = require('mongoose')

let cached = global._mongoConnection || null

async function connect(uri) {
  if (!uri) {
    console.log('No MONGODB_URI provided, using fallback')
    throw new Error('MONGODB_URI not provided')
  }
  if (cached) return cached
  
  try {
    console.log('Connecting to MongoDB...')
    const conn = await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    cached = conn
    global._mongoConnection = conn
    console.log('MongoDB connected successfully')
    return conn
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    throw error
  }
}

module.exports = { connect }
