import connectDB from '../../middleware/mongodb'
import User from '../../models/User'

const handler = async (req, res) => {
  const users = await User.find({}, 'user hotels name secondname lastname bx_id phone email public').sort({lastname:1})
  res.send(users)
}

export default connectDB(handler)
