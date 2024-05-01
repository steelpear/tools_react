import { Schema, model, models } from 'mongoose'

const Post = new Schema({
  staff_id: Array,
  staff_name: Array,
  post_num: Number
}, { collection: 'collections_collection6045d7f8ddae57de1a18bc9b' })

module.exports = models.Post || model('Post', Post)
