const config = require("../../../config");
const { verifyToken } = require("../../helpers/jwtHelper");
const renewToken = require("../../helpers/renewToken");

const { ACTKName } = config;

// api post /decoded
let decodedAPI = async (req, res) => {
  const cookie =
    req.headers.cookie &&
    !req.headers["user-agent"].includes("Expo") &&
    !req.headers["user-agent"].includes("okhttp")
      ? req.headers.cookie
          .split(`${ACTKName}=`)[1]
          .split(";")[0]
          .replace(/['"]+/g)
      : null;

  const tokenFromClient = req.headers.authorization || cookie;

  // try to decode token
  const decoded = await verifyToken(tokenFromClient);

  res
    .set("Cache-control", `public, max-age=${60 * 60}`)
    .status(200)
    .json({ success: true, decoded });
};

//api post /renew-tokens
let renewTokenAPI = async (req, res) => {
  renewToken(req, res);
};

module.exports = { decodedAPI, renewTokenAPI };
