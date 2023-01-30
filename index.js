const express = require("express");
const dbConnect = require("./dbConnect");
const authRouter = require("./routers/authRouter");
const postsRouter = require("./routers/postsRouter");
const userRouter = require("./routers/userRouter");
const dotevn = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

//process.env.CORS_ORIGIN,

const cors = require("cors");
const cloudinary = require("cloudinary").v2;
dotevn.config("./.env");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

let origin = "http://localhost:3000";
if (process.env.NODE_ENV === "production") {
  origin = process.env.CORS_ORIGIN;
}
console.log("environment origin: ", origin);
console.log("NODE_ENV: ", process.env.NODE_ENV);
//middlewares
app.use(express.json({ limit: "10mb" })); // it will fix payload too large 413 error
app.use(morgan("common"));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin,
  })
);

app.use("/auth", authRouter);
app.use("/posts", postsRouter);
app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.status(200).send("👍");
});

const PORT = process.env.PORT || 4001;
dbConnect();
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
