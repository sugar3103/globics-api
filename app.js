const express = require("express");
const cors = require("cors");
const initAPIs = require("./src/routes/api");
const { corsMiddleWare } = require("./src/middleware/cors");
const { restrict } = require("./src/middleware/restricts");

const app = express();

app.disable("x-powered-by");

// restrict access only from ...
app.use(function (req, res, next) {
  restrict(req, res, next);
});

// set cors for browser
app.use(corsMiddleWare());

// get body from request
app.use(express.json());

app.post("/", (req, res) => {
  res.status(200).send("hello world");
});

// Khởi tạo các routes cho ứng dụng
initAPIs(app);

module.exports = app;
