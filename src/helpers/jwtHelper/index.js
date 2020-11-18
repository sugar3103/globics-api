const jwt = require("jsonwebtoken");
const config = require("../../../config");

const { ACSC, RFSC, ACLE, RFLE } = config;

// AC Token Life
const accessTokenLife = ACLE || "1h";
// Have to keep this secret key secure
const accessTokenSecret =
  ACSC || "access-token-secret-myhomes-abcdefghijklmnopqrstuvwxyz-0987654321";

// RF Token Life
const refreshTokenLife = RFLE || "3650d";
// have to keep this secret key secure
const refreshTokenSecret =
  RFSC || "refresh-token-secret-myhomes-abcdefghijklmnopqrstuvwxyz-0987654321";

/**
 * private function generateToken
 * @param {user: object} props
 * @param {isRefresh: boolean} props
 */

let generateToken = (user, isRefresh) => {
  return new Promise((resolve, reject) => {
    // define the information you want to save to the Token
    const userData = {
      _id: user._id,
      name: user.username,
      // phone: user.phone,
      // email: user.email,
      read: user.read,
      write: user.write,
    };
    // sign and create token
    jwt.sign(
      { data: userData },
      isRefresh ? refreshTokenSecret : accessTokenSecret,
      {
        algorithm: "HS256",
        expiresIn: isRefresh ? refreshTokenLife : accessTokenLife,
      },
      (error, token) => {
        if (error) {
          return reject(error);
        }
        resolve(token);
      }
    );
  });
};

/**
 * This module used for verify jwt token
 * @param {token} props
 */
let verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, accessTokenSecret, (error, decoded) => {
      if (error) {
        return reject(error);
      }
      resolve(decoded);
    });
  });
};

/**
 * This module used for decode jwt token
 * @param {token} props
 */
let decodeToken = (token, secretKey) => {
  return new Promise((resolve, reject) => {});
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};
