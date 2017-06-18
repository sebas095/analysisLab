const express = require("express");
const router = express.Router();
const Sample = require("../models/sample");

module.exports = (app, mountPoint) => {
  // GET
  router.get("/", (req, res) => {
    if (req.query.type) {
      const { type } = req.query;
      Sample.findOne({ type }, (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else if (data) {
          res.status(200).json({ success: true, data });
        } else {
          res
            .status(404)
            .json({ success: false, message: "No sample with such type" });
        }
      });
    } else {
      res.status(403).json({ success: false, message: "Query params empty" });
    }
  });

  // POST
  router.post("/new", (req, res) => {
    if (req.body) {
      Sample.findOne({ type: req.body.type }, (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else if (data) {
        } else {
          Sample.create(req.body, (err, sample) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {
              res.status(200).json({ success: true });
            }
          });
        }
      });
    } else {
      res.status(403).json({ success: false, message: "Body empty" });
    }
  });

  app.use(mountPoint, router);
};
