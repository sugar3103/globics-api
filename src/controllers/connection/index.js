const { MongoClient } = require("mongodb");
const config = require("../../../config");

const { dbName } = config;

/**
 *
 * @param {username : string, password: string, canWrite: boolean} req
 */
// api post /admin-create
let connection = async (loadsuccess) => {
  MongoClient.connect(
    config.url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, db) => {
      if (err) {
        // loadsuccess({ err }); // have to use logging here
        throw err;
      }

      const dbo = db.db(dbName);
      loadsuccess({ db, dbo });
    }
  );
};

module.exports = connection;
