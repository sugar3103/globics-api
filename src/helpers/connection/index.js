const { MongoClient } = require("mongodb");
const config = require("../../../config");

const { dbName } = config;

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
