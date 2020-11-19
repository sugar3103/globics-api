const mongodb = require("mongodb");
const config = require("../../../config");

const mongoClient = mongodb.MongoClient;

// const accessTokenSecret =
//     config.access_secret ||
//     "access-token-secret-myhomes-abcdefghijklmnopqrstuvwxyz-0987654321";

const period = 60; // 1 minute

/**
 * @param {name : string, pass: string} props
 */
// api post /admin-create
let create = async (req, res) => {
  // console.log("req body ", req.body);

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
  res
    .set("Cache-control", `public, max-age=${5 * period}`)
    .status(200)
    .json({ success: req.body, username: "sugar" });
};

let decoded = (req, res) => {};

let read = (req, res) => {};

let update = (req, res) => {};

let deleted = (req, res) => {};

module.exports = {
  create,
  decoded,
  read,
  update,
  deleted,
};
