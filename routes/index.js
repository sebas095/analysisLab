const express = require("express");
const router = express.Router();
const { userController, sessionController } = require("../controllers");

module.exports = (app, mountPoint) => {
  // GET home page.
  router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
      res.render("index", {
        message: req.flash("indexMessage")
      });
    } else {
      res.redirect("/session/login");
    }
  });

  router.get("/profile", sessionController.loginRequired, (req, res) => {
    res.render("users/edit", {
      user: req.user,
      message: req.flash("userMessage")
    });
  });

  // PUT
  router.put(
    "/profile",
    sessionController.loginRequired,
    userController.updateUser
  );

  app.use(mountPoint, router);
};
