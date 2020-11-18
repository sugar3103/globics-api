// const { decodeToken } = require("../../helpers/jwt.helper");

// api post /decoded
let decodedAPI = (req, res) => {
  res
    .set("Cache-control", `public, max-age=${60 * 60}`)
    .status(200)
    .json({ success: true, username: "sugar" });
};

module.exports = { decodedAPI };
