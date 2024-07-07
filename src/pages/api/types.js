import connectDB from '../../middleware/mongodb'
import Type from '../../models/Type'

const handler = async (req, res) => {
  const types = await Type.find({}, 'name')
  res.json(types)
}

export default connectDB(handler)
