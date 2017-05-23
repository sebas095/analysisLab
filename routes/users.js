const express = require("express");
const router = express.Router();
const { userController, sessionController } = require("../controllers");

module.exports = (app, mountPoint) => {
  // GET
  router.get("/register", userController.newUser);
  router.get(
    "/admin",
    sessionController.loginRequired,
    userController.getUsers
  );
  router.get(
    "/pending/approve",
    sessionController.loginRequired,
    userController.pendingUsers
  );
  router.get(
    "/pending/deactivate",
    sessionController.loginRequired,
    userController.deactivatePendingAccount
  );

  // POST
  router.post("/register", userController.createUser);

  // PUT
  router.put(
    "/accountApproval",
    sessionController.loginRequired,
    userController.accountApproval
  );
  router.put(
    "/deactivateAccount",
    sessionController.loginRequired,
    userController.deactivateAccount
  );
  router.put(
    "/:id/deactiveAccount",
    sessionController.loginRequired,
    userController.changeState
  );
  router.put(
    "/:id",
    sessionController.loginRequired,
    userController.updateUser
  );

  // DELETE
  router.delete(
    "/:id",
    sessionController.loginRequired,
    userController.deleteUser
  );

  app.use(mountPoint, router);
};
