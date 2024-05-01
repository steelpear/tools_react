import connectDB from '../../middleware/mongodb'
import Post from '../../models/Post'

const handler = async (req, res) => {
  const posts = await Post.find()
  res.send(posts)
}

export default connectDB(handler)
