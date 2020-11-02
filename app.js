require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// requiring the routes..
const authRoutes = require("./routes/auth.js");
const userRoutes = require("./routes/user.js");
const categoryRoutes = require("./routes/category.js");
const productRoutes = require("./routes/product.js");
const orderRoutes = require("./routes/order.js");
const paymentBRoutes = require("./routes/paymentBRoutes");

const app = express();

// using the most common middlewares...
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

const port = process.env.PORT || 5000;
// Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env
//The process.env property returns an object containing the user environment
// so all the processes will be processed after checking the env file
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  });

// MY ROUTES..
// for changing any name or path ..come here
app.use("/api", authRoutes); // "/api" will be added to all the routes move to line 12
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentBRoutes);

app.listen(port, function () {
  console.log("app is running at the port 5000");
});
