import express, { Express } from "express";
import "dotenv/config";
import { connectDb } from "./config/db";
import { userRoutes } from "./router/userRouter";
import { riderRoutes } from "./router/riderRouter";


const app: Express = express();
app.use(express.json());

connectDb();

app.use("/api/users", userRoutes);
app.use("/api/riders",riderRoutes)
const PORT = process.env.PORT || 2026;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
