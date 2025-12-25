const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const productsRouter = require("./routes/products.route");
const httpStatusText = require("./utils/httpsStatusText");
const usersRouter = require("./routes/users.route");
const mailRouter = require("./routes/sendMail.route");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

app.use(
  cors({
    origin: process.env.URL,
    credentials: true,
  })
);

app.use(cookieParser());
const mongoose = require("mongoose");
app.use(express.json());
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api/send-email", mailRouter);
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("DB connected successfully"));

app.use("/uploads", express.static("uploads"));
app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    status: err.statusText || httpStatusText.ERROR,
    err: err.msg || err || "Something went wrong",
    code: err.statusCode || 500,
    data: null,
  });
});

app.listen(port, () => {
  console.log(`App listening on https://localhost:${port}`);
});
