import connectDB from '../../middleware/mongodb'
import Post from '../../models/Post'

const handler = async (req, res) => {
  const posts = await Post.find().sort({post_num:1})
  res.json(posts)
}

export default connectDB(handler)
