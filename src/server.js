// imports
//const config = require('config');
const express = require("express");
const propertyRouter = require("./routes/propertyRouter");
const homeRouter = require("./routes/homeRouter");
const companyRouter = require("./routes/companyRouter");
const userRouter = require("./routes/userRouter");
const companyAuth = require("./routes/companyAuth");
const userAuth = require("./routes/userAuth");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");

//if (!config.get('jwtPrivateKey')) {
//  console.error('FATAL ERROR');
//  process.exit(1);
//}

const app = express();

mongoose
  .connect("mongodb://localhost/Reapp")
  .then(() => console.log("Connected to mongoDB"))
  .catch((err) => console.error("Could not connect to mongoDB", err));

app.use(express.json());
app.use(cors());

app.use("/properties", propertyRouter);
app.use("/", homeRouter);
app.use("/companies", companyRouter);
app.use("/users", userRouter);
app.use("/auth", companyAuth);
app.use("/user/auth", userAuth);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
