const supertest = require("supertest-as-promised");
const host = require("../app");
const request = supertest(host);

describe("Index route", () => {
  describe("GET /", () => {
    it("should return a title", done => {
      request
        .get("/")
        .set("Accept", "application/json")
        .expect(200)
        .expect("Content-Type", "text/html; charset=utf-8")
        .then(
          res => {
            expect(res.body).to.be.empty;
            expect(res).to.have.property("text");
            done();
          },
          done
        );
    });
  });
});
