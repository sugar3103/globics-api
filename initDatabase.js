const dbInfo = require("./config");
const MongoClient = require("mongodb").MongoClient;

const createCollection = (collecttionName) => {
  MongoClient.connect(
    dbInfo.url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, db) => {
      if (err) throw err;
      const dbo = db.db("globics");
      dbo.createCollection(
        collecttionName,
        // { autoIndexId: true }, // removed from 3.4
        function (err, res) {
          if (err) throw err;
          console.log("created collection name : ", collecttionName);
          db.close();
        }
      );
    }
  );
};

createCollection("users");
createCollection("bands");

// module.exports = createCollection;
