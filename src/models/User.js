import mongoose from 'mongoose'
const { Schema } = mongoose
const User = new Schema({
  user: String,
  public: Boolean
}, { collection: 'cockpit_accounts' })

module.exports = mongoose.models.User || mongoose.model('User', User)
