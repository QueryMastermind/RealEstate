

import express from "express"
const app = express()
import dotenv from "dotenv"
import { connectdb } from "./config/db.js";
import cors from 'cors'
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import wishlistRoutes from "./routes/wishList.route.js";
import orderRoutes from "./routes/payment.routes.js";


dotenv.config();
connectdb();
app.use(express.json())
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true,
}))
const port = process.env.PORT

app.use('/api/auth', authRoutes);
app.use('/api/property', propertyRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);

app.get('/',(req,res)=>{
    res.send("welcome to index page ")
})

app.listen(port,()=>{
    console.log(`your server is running on http://localhost:${port}`)
})


process.on('SIGINT', async () => {
    console.log('SIGINT received. Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    server.close(() => {
        console.log('Server shut down.');
        process.exit(0);
    });
});