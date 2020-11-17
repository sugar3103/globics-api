const express = require("express");
const initAPIs = require("./src/routes/api");
const cors = require("cors");

const app = express();

app.disable("x-powered-by");

// restrict access only from ...
app.use(function (req, res, next) {
  if (req.hostname.includes("127.0.0.1")) {
    next();
  } else res.status(401).json({ error: "no authorization found" });
});

app.use(
  cors({
    // optionsSuccessStatus: 200,
    // methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "OS", "Origin"],
    origin: ["https://globics.com", "localhost", "10.20.12.90"],
    credentials: true,
  })
);
// Cho phép các api của ứng dụng xử lý dữ liệu từ body của request
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("hello world");
});

// Khởi tạo các routes cho ứng dụng
initAPIs(app);

module.exports = app;
