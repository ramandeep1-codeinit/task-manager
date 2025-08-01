import dotenv from "dotenv";
import connect from "./utils/db.utils.js";
import express from 'express';

dotenv.config({path: './config.env'});

const app = express();

// app.get("/" , (req ,res) => {
//     res.send("hello worlds");
// })
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT, async() => {
    console.log(`server is running at port ${PORT}`)
    await connect();
})