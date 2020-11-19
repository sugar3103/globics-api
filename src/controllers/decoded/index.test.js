const request = require("supertest");
const app = require("../../../app");
const config = require("../../../config");

const { ACTKName, RFTKName } = config;
const correctAdmin = { username: "read-admin", password: "abcxyz123456" };

describe("Test the decoded controller", () => {
  test("return the decoded user details", () => {
    return request(app)
      .post("/login-admin")
      .set({ "user-agent": "web" })
      .send(correctAdmin)
      .then((res) => {
        request(app)
          .post("/decoded")
          .set({
            "user-agent": "web",
            cookie: `${ACTKName}=${res.body.accessToken}`,
          })
          .then((res) => {
            expect(res.header["set-cookie"]).toBe(undefined);
            expect(res.body).toEqual(
              expect.objectContaining({
                success: true,
              })
            );
            expect(res.statusCode).toBe(200);
          });
      });
  });

  test("return the new access Token", () => {
    return request(app)
      .post("/login-admin")
      .set({ "user-agent": "web" })
      .send(correctAdmin)
      .then((res) => {
        setTimeout(() => {
          request(app)
            .post("/renew-tokens")
            .set({
              "user-agent": "web",
              cookie: `${RFTKName}=${res.body.refreshToken}`,
            })
            .then((res) => {
              console.log("res header", res.header, "res body", res.body);
              expect(res.header["set-cookie"].length).toBeGreaterThan(0);
              expect(res.body).toEqual(
                expect.objectContaining({
                  success: true,
                })
              );
              expect(res.statusCode).toBe(200);
            });
        }, 200);
      });
  });
});
