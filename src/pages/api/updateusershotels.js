import connectDB from '../../middleware/mongodb'
import User from '../../models/User'

const handler = async (req, res) => {
  const response = await User.updateMany({_id:req.body.ids}, {$push:{hotels:req.body.data}})
  res.json(response)
}

export default connectDB(handler)
