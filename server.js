require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json())
const userRouter = require('./router/userRouter')
app.use('/', userRouter)
const port = process.env.PORT || 2026;

app.get("/", (req, res) => {
  res.send("welcome to EDHF logistics");
});

const url = process.env.DATABASE_URL;

mongoose
  .connect(url)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(port, () => {
      console.log("App is listening on port " + port);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });
