import dotenv from "dotenv";
import connect from "./utils/db.utils.js";
import express from 'express';
import cookieParser from "cookie-parser";
import userRoutes from './routes/user.routes.js';
import taskRoutes from './routes/task.routes.js';
import projectRoutes from "./routes/project.routes.js";
import attendanceRoutes from './routes/attendance.route.js';
import taskDetailRoutes from "./routes/taskDetail.routes.js"; 
import cors from 'cors';

dotenv.config({path: './config.env'});

const app = express();

app.use(cors({
  origin: "http://localhost:3000", // your Next.js frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true // allow credentials (cookies, auth headers)
}));
app.get("/" , (req ,res) => {
    res.send("hello worlds");
})

app.use(express.json());

app.use(cookieParser());

app.use((req, res, next) => {
    // res.setHeader('Access-Control-Allow-Origin', '*' , 'http://localhost:3000');
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-access-token,authorization');
  
    console.log(`${new Date().toString()} => ${req.originalUrl}`);
    next();
});

app.use("/api/users", userRoutes);
app.use("/api", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/taskDetail", taskDetailRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, async() => {
    console.log(`server is running at port ${PORT}`)
    await connect();
})

// app.get("/test", (req, res) => {
//   res.json({ message: "API is working!" });
// });

// app.listen(4000, () => console.log("Server running on http://localhost:4000"));