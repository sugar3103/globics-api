const request = require("supertest");
const app = require("../../../app");

describe("Test the admin controller", () => {
  const correctAdmin = { username: "admin", password: "abcxyz123456" };
  const wrongAdmin = { username: "admin1", password: "123456" };

  //   test("should return success true if username is NOT duplicated in DB", () => {
  //     return request(app)
  //       .post("/create-admin")
  //       .send(correctAdmin)
  //       .then((res) => {
  //         expect(res.body).toEqual(expect.objectContaining({ success: true }));
  //         expect(res.statusCode).toBe(200);
  //       });
  //   });

  test("return true with correct username and password", () => {
    return request(app)
      .post("/login-admin")
      .set({ "user-agent": "web" })
      .send(correctAdmin)
      .then((res) => {
        expect(res.header["set-cookie"].length).toBeGreaterThan(0);
        expect(res.body).toEqual(
          expect.objectContaining({
            success: true,
          })
        );
        expect(res.statusCode).toBe(200);
      });
  });

  test("return false with wrong username or password correct", () => {
    return request(app)
      .post("/login-admin")
      .set({ "user-agent": "web" })
      .send(wrongAdmin)
      .then((res) => {
        expect(res.header["set-cookie"]).toBe(undefined);
        expect(res.body).toEqual(expect.objectContaining({ success: false }));
        expect(res.statusCode).toBe(200);
      });
  });
});
