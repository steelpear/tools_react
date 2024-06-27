import connectDB from '../../middleware/mongodb'
import City from '../../models/City'

const handler = async (req, res) => {
  const cities = await City.find({$or:[{level:0}, {level:1}]}, 'name level parent').sort({level:1})
  res.json(cities)
}

export default connectDB(handler)
