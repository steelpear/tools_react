import connectDB from '../../middleware/mongodb'
import User from '../../models/User'

const handler = async (req, res) => {
  const response = await User.findByIdAndUpdate(req.body.id, {$pull: {hotels:req.body.data}})
  res.json(response)
}

export default connectDB(handler)
