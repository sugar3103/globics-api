const request = require("supertest");
const app = require("../../../app");

describe("Test the logout controller", () => {
  test("return true with the length of set-cookie array > 0", () => {
    return request(app)
      .post("/logout")
      .then((res) => {
        expect(res.body).toEqual(expect.objectContaining({ success: true }));
        expect(res.headers["set-cookie"].length).toBeGreaterThan(0);
        expect(res.statusCode).toBe(200);
      });
  });
});
