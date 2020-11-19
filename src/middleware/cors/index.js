const cors = require("cors");

function corsMiddleWare(req, res, next) {
  return cors({
    // optionsSuccessStatus: 200,
    // methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "OS", "Origin"],
    origin: [
      "globics.com",
      "http://localhost:3000",
      "http://10.20.12.90:3000",
      "http://127.0.0.1:3000",
    ],
    // preflightContinue: true,
    credentials: true,
  });
}

module.exports = { corsMiddleWare };
