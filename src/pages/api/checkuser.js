import connectDB from '../../middleware/mongodb'
import User from '../../models/User'

const handler = async (req, res) => {
  const user = await User.find({public: true, user: req.body, groups: {$in: ['63be8023667d8c4348544324']}}, 'user')
  res.send(user)
}

export default connectDB(handler)
