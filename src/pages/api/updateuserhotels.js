import connectDB from '../../middleware/mongodb'
import User from '../../models/User'

const handler = async (req, res) => {
  const response = await User.findByIdAndUpdate(req.body.id, { hotels:  req.body.data },  {new: true})
  res.json(response._id == req.body.id ? true : false)
}

export default connectDB(handler)
