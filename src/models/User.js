import mongoose from 'mongoose'
const { Schema } = mongoose
const User = new Schema({
  _id: String,
  user: String,
  hotels: Array,
  public: Boolean
}, { collection: 'cockpit_accounts' })

module.exports = mongoose.models.User || mongoose.model('User', User)
