const config = require("../../../config");

const { domain, ACTK, ACLE, RFTK, RFLE } = config;

let logout = (req, res) => {
  return res
    .cookie(ACTK, "removed", {
      domain: domain,
      maxAge: 0, // 0 in milisecond
      httpOnly: true,
      secure: true,
      sameSite: true,
    })
    .cookie(RFTK, "removed", {
      domain: domain,
      maxAge: 0, // 0 in milisecond
      httpOnly: true,
      secure: true,
      sameSite: true,
    })
    .cookie(ACLE, "removed", {
      domain: domain,
      maxAge: 0, // 0 in milisecond
    })
    .cookie(RFLE, "removed", {
      domain: domain,
      maxAge: 0, // 0 in milisecond
    })
    .cookie("MH_RD_TK", "removed", {
      domain: domain,
      maxAge: 0, // 0 in milisecond
      httpOnly: true,
      secure: true,
    })
    .json({ success: true, logged_out: true });
};

module.exports = { logout };
