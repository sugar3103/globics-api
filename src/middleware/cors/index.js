const cors = require("cors");

function corsMiddleWare(req, res, next) {
  return cors({
    // optionsSuccessStatus: 200,
    // methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "OS", "Origin"],
    origin: ["https://globics.com", "localhost", "10.20.12.90"],
    credentials: true,
  });
}

module.exports = { corsMiddleWare };
