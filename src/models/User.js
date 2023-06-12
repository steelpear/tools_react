import { Schema, model, models } from 'mongoose'

const User = new Schema({
  _id: String,
  user: String,
  hotels: Array,
  public: Boolean
}, { collection: 'cockpit_accounts' })

module.exports = models.User || model('User', User)
