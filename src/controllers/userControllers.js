const mongodb = require("mongodb");
const config = require("../../config");

// const jwtHelper = require("../helpers/jwt.helper");

const mongoClient = mongodb.MongoClient;

// const accessTokenSecret =
//     config.access_secret ||
//     "access-token-secret-myhomes-abcdefghijklmnopqrstuvwxyz-0987654321";

// const period = 5 * 60; //5 minutes;

let profile = async (req, res) => {
  // const cookie =
  //     req.headers.cookie &&
  //     !req.headers["user-agent"].includes("Expo") &&
  //     !req.headers["user-agent"].includes("okhttp") ?
  //     req.headers.cookie.split("MH_AC_TK=")[1].split(";")[0].replace(/['"]+/g) :
  //     null;
  // const tokenFromClient = req.headers.authorization || cookie;
  // const decoded = await jwtHelper.verifyToken(
  //     tokenFromClient,
  //     accessTokenSecret
  // );
  // res
  // .set("Cache-control", `public, max-age=${period}`)
  // .status(200)
  // .json({ decoded: decoded.data });
  console.log("req body ", req.body);
  res.json({ success: "data from profile" });
};

module.exports = {
  profile,
};
