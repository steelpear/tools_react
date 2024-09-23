import connectDB from '../../middleware/mongodb'
import Hotel from '../../models/Hotel'

const handler = async (req, res) => {
  const hotels = await Hotel.find({'name': {$in: req.body}}, '_id')
  res.json(hotels)
}

export default connectDB(handler)
