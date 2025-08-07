import dotenv from "dotenv";
import connect from "./utils/db.utils.js";
import express from 'express';
import userRoutes from './routes/user.routes.js';
import cors from 'cors';

dotenv.config({path: './config.env'});

const app = express();


app.use(cors({
  origin: "http://localhost:3000", // your Next.js frontend
  credentials: true // allow credentials (cookies, auth headers)
}));
// app.get("/" , (req ,res) => {
//     res.send("hello worlds");
// })
app.use(express.json());

app.use((req, res, next) => {
    // res.setHeader('Access-Control-Allow-Origin', '*' , 'http://localhost:3000');
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-access-token,authorization');
  
    console.log(`${new Date().toString()} => ${req.originalUrl}`);
    next();
});

app.use("/api/users", userRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, async() => {
    console.log(`server is running at port ${PORT}`)
    await connect();
})