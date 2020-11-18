/**
 * controller renewToken
 * @param {*} req
 * @param {*} res
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

  // User gửi mã refresh token kèm theo trong body
  const cookie = req.headers.cookie
    ? req.headers.cookie.split("MH_RF_TK=")[1].split(";")[0].replace(/['"]+/g)
    : null;

  const refreshTokenFromClient = req.headers.authorization || cookie;
  // console.log("req header refresh token", req.headers);
  const responseAccess = async () => {
    try {
      // Verify kiểm tra tính hợp lệ của cái refreshToken và lấy dữ liệu giải mã decoded
      const decoded = await jwtHelper.verifyToken(
        refreshTokenFromClient,
        refreshTokenSecret
      );

      // Thông tin user lúc này các bạn có thể lấy thông qua biến decoded.data
      // có thể mở comment dòng debug bên dưới để xem là rõ nhé.
      // debug("decoded: ", decoded);
      const userData = decoded.data;

      //    `Thực hiện tạo mã Token trong bước gọi refresh Token, [thời gian sống vẫn là 1 giờ.]`

      const accessToken = await jwtHelper.generateToken(
        userData,
        accessTokenSecret,
        accessTokenLife
      );
      // gửi token mới về cho người dùng
      return res
        .cookie("MH_AC_TK", accessToken, {
          domain: config.domain,
          maxAge: 1 * milisecond, // 1 hour in milisecond
          httpOnly: true,
          secure: true,
          sameSite: true,
        })
        .cookie("MH_A_L", exp1Hour, {
          domain: config.domain,
          maxAge: 1 * milisecond,
          // secure: true,
          // sameSite: true,
        })
        .json({ accessToken, accessLife: Date.now() + 1 * milisecond });
    } catch (error) {
      res.status(403).json({
        message: "Invalid refresh token.",
      });
    }
  };
  // Nếu như tồn tại refreshToken truyền lên và nó cũng nằm trong tokenList của chúng ta
  if (refreshTokenFromClient) {
    mongoClient.connect(
      config.mongoUrl,
      { useNewUrlParser: true, useUnifiedTopology: true },
      function (err, db) {
        if (err) throw err;
        db.db("myhomes")
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
            if (response) {
              responseAccess();
            } else {
              res.status(200).json({
                // can't find token in DB
                error: `there is no refresh token in DB`,
              });
            }
          });
      }
    );
  } else {
    // Không tìm thấy token trong request
    return res.status(403).send({
      message: "No token provided.",
    });
  }
};

module.exports = renewToken;
