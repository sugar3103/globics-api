const express = require("express");
const router = express.Router();
const { createAdmin, readAdmin } = require("../controllers/admin");
const { logout } = require("../controllers/logout");
const { isAuth } = require("../middleware/authMiddleware");

/**
 *
 * @param {*} app // get from app.js
 */

let initAPIs = (app) => {
  router.post("/create-admin", createAdmin);
  router.post("/login-admin", readAdmin);
  router.post("/logout", logout);

  // Sử dụng authMiddleware.isAuth trước những api cần xác thực
  router.use(isAuth);

  // List Protect APIs:

  return app.use("/", router);
};

module.exports = initAPIs;
