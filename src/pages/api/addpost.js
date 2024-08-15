import connectDB from '../../middleware/mongodb'
import Post from '../../models/Post'

const handler = async (req, res) => {
  const post = new Post(req.body)
  await post.save()
  res.json(post._id)
}

export default connectDB(handler)
