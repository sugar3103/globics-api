const bcrypt = require("bcrypt");
const connection = require("../connection");

/**
 *
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
      res.json({ error: "error with connection" });
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
          res.json({ error });
        });
  });
};

let decodedAdmin = (req, res) => {
  // res
  //   .set("Cache-control", `public, max-age=${60 * period}`)
  //   .status(200)
  //   .json({ success: req.body, username: "sugar" });
};

let readAdmin = (req, res) => {
  const { username, password } = req.body;

  connection((result) => {
    const { err, db, dbo } = result;
    if (err) {
      res.json({ error: "error with connection" });
    } else
      dbo
        .collection("admin")
        .findOne({ username })
        .then((response) => {
          if (response) {
            bcrypt.compareSync(password, response.password) // responseToken(response, db);
              ? // responseToken(response, db, req, res) :
                res.json({ success: true, message: "logged in success" })
              : res.status(200).json({
                  success: false,
                  error: "username or password incorrect",
                });
          } else {
            res.status(200).json({
              success: false,
              error: "username or password incorrect", //do NOT res no user found *risk
            });
          }

          db.close();
        })
        .catch((error) => {
          // console.log("error", error); // have to use logging here
          res.json({ error });
        });
  });
};

let updateAdmin = (req, res) => {};

let deleteAdmin = (req, res) => {};

module.exports = {
  createAdmin,
  decodedAdmin,
  readAdmin,
  updateAdmin,
  deleteAdmin,
};
