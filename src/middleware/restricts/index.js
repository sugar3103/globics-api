function restrict(req, res, next) {
  if (req.hostname.includes("127.0.0.1")) {
    next();
  } else res.status(401).json({ error: "no authorization found" });
}

module.exports = { restrict };
