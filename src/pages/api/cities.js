import connectDB from '../../middleware/mongodb'
import City from '../../models/City'

const handler = async (req, res) => {
  const cities = await City.find({}, 'name')
  res.send(cities)
}

export default connectDB(handler)
