import connectDB from '../../middleware/mongodb'
import Hotel from '../../models/Hotel'

const handler = async (req, res) => {
  let hotels = null
  if (req.body.mode == 'exact') {hotels = await Hotel.find({'name': {$in: req.body.data}}, '_id')} 
  else {hotels = await Hotel.find({'name': {$regex: req.body.data, $options: 'i'}}, '_id')}
  res.json(hotels)
}

export default connectDB(handler)
