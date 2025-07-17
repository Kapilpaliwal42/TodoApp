import express from "express"
import dotenv from "dotenv"
import dbConnection from "./database/Database.js";
import cors from "cors"
import authRouter from "./routes/routes.js"
import todoRouter from "./routes/todoRoutes.js"; // Import the new todo routes

dotenv.config()
dbConnection()
const PORT=process.env.PORT || 3000;
const app=express();
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use("/api/auth",authRouter)
app.use("/api/todos", todoRouter); 


app.listen(PORT,()=>{
    console.log(`server is running at port : ${PORT}`)
})
