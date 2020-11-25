const config = require("../../../config");
const connection = require("../connection");
const { verifyToken, generateToken } = require("../jwtHelper");

const { domain, ACTKName, ACLEName, RFTKName, secure } = config;
const milisecond = 60 * 60 * 1000; // 1 hour in milisecond
const exp1Hour = new Date().getTime() + milisecond; // exp time in the next 1 hour

/**
 * controller renewToken
 * @param {*} req
 */
let renewToken = async (req, res) => {
  const userAgent = req.headers["user-agent"];
  const userDevice = userAgent.includes("Expo")
    ? "Expo"
    : userAgent.includes("okhttp") ||
      userAgent.includes("android") ||
      userAgent.includes("ios")
    ? "mobile"
    : "web";

  // User send token with the headers
  const cookie =
    req.headers.cookie && req.headers.cookie.includes(`${RFTKName}`)
      ? req.headers.cookie
          .split(`${RFTKName}=`)[1]
          .split(";")[0]
          .replace(/['"]+/g)
      : null;

  const refreshTokenFromClient = req.headers.authorization || cookie;

  // IF refreshToken from client match our refresh token from DB
  if (refreshTokenFromClient) {
    // Verify the valid of the refresh token from client
    const decoded = await verifyToken(refreshTokenFromClient, true);

    // User Information now can access through userDate below
    const userData = decoded.data;

    // Renew Access Secret
    const accessToken = await generateToken(userData);

    connection((result) => {
      const { err, db, dbo } = result;
      if (err) {
        res.json({ error: "error with connection" });
      } else
        dbo
          .collection("tokens")
          .findOne({
            refreshTokenList: {
              $elemMatch: {
                device: userDevice,
                refreshToken: refreshTokenFromClient,
              },
            },
          })
          .then((response) => {
            db.close();
            if (response) {
              // send to client
              res
                .cookie(ACTKName, accessToken, {
                  domain: domain,
                  maxAge: 1 * milisecond, // 1 hour in milisecond
                  httpOnly: true,
                  secure,
                  sameSite: true,
                })
                .cookie(ACLEName, exp1Hour, {
                  domain: domain,
                  maxAge: 1 * milisecond,
                  // secure: true,
                  // sameSite: true,
                })
                .json({
                  success: true,
                  accessToken,
                  accessLife: Date.now() + 1 * milisecond,
                });
            } else {
              db.close();
              res.status(200).json({
                success: false,
                // can't find token in DB
                error: `there is no refresh token in DB`,
              });
            }
          })
          .catch((err) =>
            res
              .status(403)
              .json({ success: false, err, error: "invalid refresh token" })
          );
    });
  } else {
    // Không tìm thấy token trong request
    return res.status(403).send({
      message: "No token provided.",
    });
  }
};

module.exports = renewToken;
