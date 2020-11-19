const bcrypt = require("bcrypt");

const connection = require("../../helpers/connection");
const responseToken = require("../../helpers/responseToken");

/**
 * @param {username : string, password: string, canWrite: boolean} req
 */
// api post /admin-create
let createAdmin = async (req, res) => {
  const { username, password, canWrite } = req.body;

  const hashPassword = bcrypt.hashSync(password, 10);
  const adminInfo = {
    username,
    password: hashPassword,
    read: true,
    write: canWrite,
    lastModified: new Date().toISOString(),
    registerDate: new Date().toISOString(),
  };

  connection((result) => {
    const { err, db, dbo } = result;
    if (err) {
      res.json({ success: false, error: "error with connection" });
    } else
      dbo
        .collection("admin")
        .insertOne(adminInfo)
        .then((response) => {
          res.status(200).json({ success: true, username: response.ops[0] });
          db.close();
        })
        .catch((error) => {
          // console.log("error", error); // have to use logging here
          res.json({ success: false, error });
        });
  });
};

/**
 *
 * @param {username : string, password: string} req
 */
// api post /login-admin
let readAdmin = (req, res) => {
  const { username, password } = req.body;
  const collectionName = "admin";

  // console.log("username, password", username, password);

  connection((result) => {
    const { err, db, dbo } = result;
    if (err) {
      res.json({ error: "error with connection" });
    } else
      dbo
        .collection(collectionName)
        .findOne({ username })
        .then((response) => {
          if (response) {
            bcrypt.compareSync(password, response.password)
              ? responseToken(response, collectionName, db, dbo, req, res)
              : res.status(200).json({
                  success: false,
                  error: "username or password incorrect",
                });
          } else {
            db.close();
            res.status(200).json({
              success: false,
              error: "username or password incorrect", //do NOT res no user found *risk
            });
          }
        })
        .catch((err) => res.json({ success: false, err }));
  });
};

let updateAdmin = (req, res) => {};

let deleteAdmin = (req, res) => {};

module.exports = {
  createAdmin,
  readAdmin,
  updateAdmin,
  deleteAdmin,
};
