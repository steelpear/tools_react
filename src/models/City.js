import { Schema, model, models } from 'mongoose'

const City = new Schema({
  name: String
}, { collection: 'collections_collection5a5dc18e670fd819bca20d99' })

module.exports = models.City || model('City', City)
