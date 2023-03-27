import mongoose from 'mongoose'

const { Schema } = mongoose
const Hotel = new Schema({
  name: String,
  puma: Boolean,
  sat_active: Boolean,
  phone1: String,
  email: String,
  slider_banner_code: String,
  slider_banner_code_bottom: String,
  popup_text: String,
  documents_arrival: String,
  slider_banner: Boolean,
  slider_banner_bottom: Boolean,
  popup_active: Boolean,
  popup_name: String,
  popup_url: String,
  popup_width: String,
  popup_height: String,
  popup_image: String,
  popup_delay: String,
  popup_show_portal: Boolean,
  text_overlay: Boolean,
  text_background: Boolean,
  disable_cookie: Boolean,
  show_on_main_page_only: Boolean,
  alean_url: String,
  alean_id: String,
  sat_email: String,
  calc_type: String,
  invader_on: Boolean,
  invader: Array,
  invader_interval: String,
  invader_position: String,
  invader_close: Boolean,
  chat_enable: Boolean,
  chat_code: String
}, { collection: 'collections_collection5a5dc18e670fd819bca20da7' })

module.exports = mongoose.models.Hotel || mongoose.model('Hotel', Hotel)
