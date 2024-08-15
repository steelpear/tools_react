import connectDB from '../../middleware/mongodb'
import Post from '../../models/Post'

const handler = async (req, res) => {
  const response = await Post.findByIdAndUpdate(req.body.id, { $pull: { staff: { $in: [req.body.data] } } })
  res.json(response)
}

export default connectDB(handler)
