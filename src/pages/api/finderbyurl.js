import connectDB from '../../middleware/mongodb'
import Hotel from '../../models/Hotel'

const handler = async (req, res) => {
  let hotels = null
  if (req.body.mode == 'exact') {hotels = await Hotel.find({$or:[{'sat_domain': {$in: req.body.data}}, {'href': {$in: req.body.data}}, {'portal_link': {$in: req.body.data}}, {'name_slug': {$in: req.body.data}}]}, '_id')} 
  else {hotels = await Hotel.find({$or:[{'sat_domain': {$regex: req.body.data, $options: 'i'}}, {'href': {$regex: req.body.data, $options: 'i'}}, {'portal_link': {$regex: req.body.data, $options: 'i'}}, {'name_slug': {$regex: req.body.data, $options: 'i'}}]}, '_id')}
  res.json(hotels)
}

export default connectDB(handler)
