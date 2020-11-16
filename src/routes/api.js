const express = require("express");
const userControllers = require("../controllers/userControllers");
const router = express.Router();
const AuthMiddleWare = require("../middleware/AuthMiddleware");

//  * Init all APIs on your application
//  * @param {*} app from express
//
let initAPIs = (app) => {
  router.post("/profile", userControllers.profile);
  // Sử dụng authMiddleware.isAuth trước những api cần xác thực
  router.use(AuthMiddleWare.isAuth);

  // List Protect APIs:

  // router.post("/user-bds-list", UserController.userBdsList);

  return app.use("/", router);
};

module.exports = initAPIs;
