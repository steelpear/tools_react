import connectDB from '../../middleware/mongodb'
import Hotel from '../../models/Hotel'

const handler = async (req, res) => {
  const { id, data } = req.body
  const response = await Hotel.findByIdAndUpdate(id, data, {new: true})
  res.json(response.puma)
}

export default connectDB(handler)
