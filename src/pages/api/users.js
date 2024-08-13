import connectDB from '../../middleware/mongodb'
import User from '../../models/User'

const handler = async (req, res) => {
  const users = await User.find({public: true}, 'user lastname').sort({lastname:1})
  res.send(users)
}

export default connectDB(handler)
