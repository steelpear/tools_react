import mongoose from 'mongoose'

const { Schema } = mongoose
const City = new Schema({
  name: String
}, { collection: 'collections_collection5a5dc18e670fd819bca20d99' })

module.exports = mongoose.models.City || mongoose.model('City', City)
