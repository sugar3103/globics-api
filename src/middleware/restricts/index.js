const { domain } = require("../../../config.js");

function restrict(req, res, next) {
  if (req.hostname.includes(domain)) {
    next();
  } else res.status(401).json({ error: "no authorization found" });
}

module.exports = { restrict };
