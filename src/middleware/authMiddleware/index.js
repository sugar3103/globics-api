// const jwtHelper = require("../helpers/jwt.helper");

const config = require("../../../config");

// const debug = console.log.bind(console);
// Mã secretKey này phải được bảo mật tuyệt đối, các bạn có thể lưu vào biến môi trường hoặc file
const accessTokenSecret =
  config.access_secret ||
  "access-token-secret-myhomes-abcdefghijklmnopqrstuvwxyz-0987654321";

/**
 * Middleware: Authorization user by Token
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

let isAuth = async (req, res, next) => {
  // Lấy token được gửi lên từ phía client, thông thường tốt nhất là các bạn nên truyền token vào header

  // console.log("user headers", req.headers);

  const cookie =
    req.headers.cookie &&
    !req.headers["user-agent"].includes("Expo") &&
    !req.headers["user-agent"].includes("okhttp")
      ? req.headers.cookie.split("MH_AC_TK=")[1].split(";")[0].replace(/['"]+/g)
      : null;

  const tokenFromClient = req.headers.authorization || cookie;

  if (tokenFromClient) {
    // Nếu tồn tại token
    try {
      // Thực hiện giải mã token xem có hợp lệ hay không?
      // const decoded = await jwtHelper.verifyToken(
      //     tokenFromClient,
      //     accessTokenSecret
      // );

      // Nếu token hợp lệ, lưu thông tin giải mã được vào đối tượng req, dùng cho các xử lý ở phía sau.
      // req.jwtDecoded = decoded;

      // Cho phép req đi tiếp sang controller.
      next();
    } catch (error) {
      // Nếu giải mã gặp lỗi: Không đúng, hết hạn...etc:
      // Lưu ý trong dự án thực tế hãy bỏ dòng debug bên dưới, mình để đây để debug lỗi cho các bạn xem thôi
      // debug("Error while verify token:", error);
      return res.status(200).json({
        message: "Unauthorized.",
      });
    }
  } else {
    // Không tìm thấy token trong request
    return res.status(403).send({
      message: "No token provided.",
    });
  }
};

module.exports = {
  isAuth: isAuth,
};
