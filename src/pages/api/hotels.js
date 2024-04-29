import connectDB from '../../middleware/mongodb'
import Hotel from '../../models/Hotel'

const handler = async (req, res) => {
  const hotels = await Hotel.find({ puma: true }, 'name city href sat_domain portal_link phone1 phone2 site_type sat_template')
  res.send(hotels)
}

export default connectDB(handler)
