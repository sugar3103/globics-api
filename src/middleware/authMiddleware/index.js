const config = require("../../../config");
const { verifyToken } = require("../../helpers/jwtHelper");

const { ACTKName } = config;

/**
 * Middleware: Authorization user by Token
 * @param {req, res , next} props
 */

let isAuth = async (req, res, next) => {
  // Get token from client which is attached in header, dot NOT send from body
  // console.log("user headers", req.headers);

  const cookie =
    req.headers.cookie && req.headers.cookie.includes(`${ACTKName}`)
      ? req.headers.cookie
          .split(`${ACTKName}=`)[1]
          .split(";")[0]
          .replace(/['"]+/g)
      : null;

  const tokenFromClient = req.headers.authorization || cookie;

  // if Token exist
  if (tokenFromClient) {
    try {
      // try to decode token
      const decoded = await verifyToken(tokenFromClient);

      // If token is valid, save to to req
      req.jwtDecoded = decoded;

      // process to next if token valid.
      next();
    } catch (error) {
      // if decode token got problem such as : expired, not correct, ...
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }
  } else {
    // token not found from request
    return res.status(403).send({
      message: "No token provided.",
    });
  }
};

module.exports = { isAuth };
