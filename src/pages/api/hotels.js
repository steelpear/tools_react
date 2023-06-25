import connectDB from '../../middleware/mongodb'
import Hotel from '../../models/Hotel'
import City from '../../models/City'
import User from '../../models/User'

const handler = async (req, res) => {
  const out = []
  const hotels = await Hotel.find({ puma: true }, 'name city email href sat_domain portal_link phone1 phone2 site_type sat_template sat_active temporarily_disable sat_finish')
  const cities = await City.find({}, 'name')
  const users = await User.find({public: true}, 'user hotels')
  await hotels.forEach(hotel => {
    const city = cities.filter(item => { return item._id == hotel.city[hotel.city.length - 1] })
    const user = users.filter(item => { return item.hotels.includes(hotel._id) })
    const staff = user.map(item => { return { user: item.user, _id: item._id } })
    hotel.city = city[0] ? city[0].name : 'Нет региона'
    hotel.staff = staff
    hotel.site_type = hotel.site_type ? hotel.site_type : 'Нет сайта'
    out.push(hotel)
  })
  await res.send(out)
}

export default connectDB(handler)
