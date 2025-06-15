const express = require('express')
const sequelize = require('./config/db')
const handleError = require('./middleware/handleError')
const app = express()
const port = 8080
const cors = require('cors');
const cookieParser = require('cookie-parser')
const { initializeSocket } = require('./socket')
const http = require('http')
const httpServer = http.createServer(app)

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const topicRoutes = require('./routes/topics');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');
const notificationRoutes = require('./routes/notification');
const newsRoutes = require('./routes/news');
const productRoutes = require('./routes/product');
const vnpayRoutes = require('./routes/vnpay');
const orderRoutes = require('./routes/order');

// khởi tạo socket
initializeSocket(httpServer);

//config
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Auth routes
app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', topicRoutes)
app.use('/api', postRoutes)
app.use('/api', commentRoutes)
app.use('/api', likeRoutes)
app.use('/api', notificationRoutes)
app.use('/api', newsRoutes)
app.use('/api', productRoutes)
app.use('/api', vnpayRoutes)


// Database connection
const connectDB = async () => {
    try {
        await sequelize.authenticate()
        console.log('Connect DB success')
    } catch (error) {
        console.error('Unable to connect to the database:', error)
    }
}
connectDB()// Auto connect to database

app.use(handleError) // middleware handle error đặt ở cuối

// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })

httpServer.listen(port, () => {
    console.log(`Socket and server running on ${port} `);
});