const config = require("../../../config");
const { generateToken } = require("../jwtHelper");

const { domain, ACTKName, RFTKName, ACLEName, RFLEName, RDTK } = config;

// declare time for token
const milisecond = 60 * 60 * 1000; // 1 hour in milisecond
const exp1Hour = new Date().getTime() + milisecond; // exp time in the next 1 hour
const exp10Year = new Date().getTime() + 3650 * 24 * milisecond; // exp time in 3650 days
const mathRan = Math.random().toString(36).substring(2, 15); // create random string for random cookie

/**
 * @param {data: object} props // the object of user data
 * @param {collectionName: string} props // the collectionName to modify user last logged in
 * @param {db: DB from connection} props
 * @param {dbo: DB object from connection} props
 * @param {req, res} props
 */

const responseToken = async (data, collectionName, db, dbo, req, res) => {
  const { _id, username } = data;

  // get user information
  const userAgent = req.headers["user-agent"];
  const userDevice = userAgent.includes("Expo")
    ? "Expo"
    : userAgent.includes("okhttp") ||
      userAgent.includes("android") ||
      userAgent.includes("ios")
    ? "mobile"
    : "web";

  // create access Token with life
  const accessToken = await generateToken(data, (isRefresh = false));
  // create refresh Token with life
  const refreshToken = await generateToken(data, (isRefresh = true));

  // pull old refresh token from tokenList
  dbo
    .collection("tokens")
    .updateOne(
      { username },
      {
        $pull: { refreshTokenList: { device: userDevice } },
      }
    )
    .then((responsePull) => {
      // add new token to tokenList and set last modified
      dbo
        .collection("tokens")
        .updateOne(
          { username },
          {
            $set: {
              lastModified: new Date().toISOString(),
            },
            $addToSet: {
              refreshTokenList: {
                device: userDevice,
                refreshToken,
                loggedInIP: req.headers["x-forwarded-for"],
              },
              loggedInIP: req.headers["x-forwarded-for"],
            },
          },
          { upsert: true }
        )
        .then((responseUpdate) => {
          // set last loggedin for user
          dbo
            .collection(collectionName)
            .updateOne(
              { _id },
              {
                $set: {
                  lastLoggedIn: new Date().toISOString(),
                },
              }
            )
            .then((result) => db.close());
          return res
            .cookie(ACTKName, accessToken, {
              domain: domain,
              maxAge: 1 * milisecond, // 1 hour in milisecond
              httpOnly: true,
              secure: true,
              sameSite: true,
            })
            .cookie(RFTKName, refreshToken, {
              domain: domain,
              maxAge: 3650 * 24 * milisecond, // 10 years in milisecond
              httpOnly: true,
              secure: true,
              sameSite: true,
            })
            .cookie(ACLEName, exp1Hour, {
              domain: domain,
              maxAge: 1 * milisecond,
              // secure: true,
              // sameSite: true,
            })
            .cookie(RFLEName, exp10Year, {
              domain: domain,
              maxAge: 3650 * 24 * milisecond,
              // secure: true,
              // sameSite: true,
            })
            .cookie(RDTK, mathRan, {
              domain: domain,
              maxAge: 365 * 24 * milisecond,
              httpOnly: true,
              secure: true,
            })
            .json({
              accessToken,
              refreshToken,
              accessLife: Date.now() + 1 * milisecond,
              refreshLife: Date.now() + 3650 * 24 * milisecond,
              success: true,
            });
        })
        .catch((err) => res.json({ success: false, err }));
    });

  //save 2 token into list
  // Lưu lại 2 mã access & Refresh token, với key chính là cái refreshToken để đảm bảo unique và không sợ hacker sửa đổi dữ liệu truyền lên.
};

module.exports = responseToken;
