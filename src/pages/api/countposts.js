import connectDB from '../../middleware/mongodb'
import Post from '../../models/Post'

const handler = async (req, res) => {
    const response = await Post.count()
    res.json(response)
}

export default connectDB(handler)
