import adminRouter from "./routes/admin";
import userRouter from "./routes/user";
import  express from "express";
import cors from "cors";


const app=express();

app.use(cors());
app.use(express.json());

app.use("/admin",adminRouter);
app.use("/user",userRouter)
app.get('/health', (req, res) => res.status(200).send('OK'));


app.listen(3000,()=>{
    console.log("server is running on port 3001")
})