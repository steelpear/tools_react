import { Schema, model, models } from 'mongoose'

const Type = new Schema({
    name: String
  }, { collection: 'collections_collection5a5dc18e670fd819bca20d9b' })
  
  module.exports = models.Type || model('Type', Type)
