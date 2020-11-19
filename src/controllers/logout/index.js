const config = require("../../../config");

const { domain, ACTKName, ACLEName, RFTKName, RFLEName, RDTK, secure } = config;

let logout = (req, res) => {
  return res
    .cookie(ACTKName, "removed", {
      domain: domain,
      maxAge: 0, // 0 in milisecond
      httpOnly: true,
      secure,
      sameSite: true,
    })
    .cookie(RFTKName, "removed", {
      domain: domain,
      maxAge: 0, // 0 in milisecond
      httpOnly: true,
      secure,
      sameSite: true,
    })
    .cookie(ACLEName, "removed", {
      domain: domain,
      maxAge: 0, // 0 in milisecond
    })
    .cookie(RFLEName, "removed", {
      domain: domain,
      maxAge: 0, // 0 in milisecond
    })
    .cookie(RDTK, "removed", {
      domain: domain,
      maxAge: 0, // 0 in milisecond
      httpOnly: true,
      secure,
    })
    .json({ success: true, logged_out: true });
};

module.exports = { logout };
