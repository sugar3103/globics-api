const request = require("supertest");
const app = require("../../../app");
const config = require("../../../config");

describe("Test the decoded controller", () => {
  const correctAdmin = { username: "read-admin", password: "abcxyz123456" };

  test("return the decoded user details", () => {
    return request(app)
      .post("/login-admin")
      .set({ "user-agent": "web" })
      .send(correctAdmin)
      .then((res) => {
        request(app)
          .post("/decoded")
          .set({ authorization: res.body.accessToken })
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
});
