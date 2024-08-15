import connectDB from '../../middleware/mongodb'
import Post from '../../models/Post'

const handler = async (req, res) => {
    await Post.findByIdAndRemove(req.body.id)
    res.json({ state: true })
}

export default connectDB(handler)
