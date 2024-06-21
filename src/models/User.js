import { Schema, model, models } from 'mongoose'

const User = new Schema({
  user: String,
  email: String,
  lastname: String,
  name: String,
  secondname: String,
  phone: String,
  password: String,
  public: Boolean,
  hotels: Array,
  portal_list: Array,
  bx_id: String,
  agencies: Array
}, { collection: 'cockpit_accounts' })

module.exports = models.User || model('User', User)
