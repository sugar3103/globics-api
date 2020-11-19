const express = require("express");
const router = express.Router();
const { createAdmin, readAdmin } = require("../controllers/admin");
const { decodedAPI, renewTokenAPI } = require("../controllers/decoded");
const { logout } = require("../controllers/logout");
const renewToken = require("../helpers/renewToken");
const { isAuth } = require("../middleware/authMiddleware");

/**
 *
 * @param {app} props // get from app.js
 */

let initAPIs = (app) => {
  router.post("/renew-token", renewToken);
  router.post("/create-admin", createAdmin);
  router.post("/login-admin", readAdmin);
  router.post("/logout", logout);
  router.post("/renew-tokens", renewTokenAPI);

  router.use(isAuth);

  router.post("/decoded", decodedAPI);
  return app.use("/", router);
};

module.exports = initAPIs;
