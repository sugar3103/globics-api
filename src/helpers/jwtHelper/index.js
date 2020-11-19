const jwt = require("jsonwebtoken");
const config = require("../../../config");

const { ACSC, RFSC, ACLE, RFLE } = config;

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
      username: user.username,
      // phone: user.phone,
      // email: user.email,
      read: user.read,
      write: user.write,
    };
    // sign and create token
    jwt.sign(
      { data: userData },
      isRefresh ? RFSC : ACSC,
      {
        algorithm: "HS256",
        expiresIn: isRefresh ? RFLE : ACLE,
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
let verifyToken = (token, isRefresh) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, isRefresh ? RFSC : ACSC, (error, decoded) => {
      if (error) {
        return reject(error);
      }
      resolve(decoded);
    });
  });
};

module.exports = {
  generateToken,
  verifyToken,
};
