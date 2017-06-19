const express = require("express");
const router = express.Router();
const {
  userController,
  sessionController,
  quotationController
} = require("../controllers");

module.exports = (app, mountPoint) => {
  // GET
  router.get("/new", sessionController.loginRequired, quotationController.new);

  router.get(
    "/search",
    sessionController.loginRequired,
    quotationController.search
  );

  router.get(
    "/pending/approval",
    sessionController.loginRequired,
    quotationController.pending
  );

  router.get(
    "/pending/delete",
    sessionController.loginRequired,
    quotationController.pendingDelete
  );

  router.get(
    "/menu",
    sessionController.loginRequired,
    quotationController.menu
  );
  router.get(
    "/approval",
    sessionController.loginRequired,
    quotationController.approval
  );

  router.get(
    "/:id/export",
    sessionController.loginRequired,
    quotationController.exportToWord
  );

  router.get(
    "/:id",
    sessionController.loginRequired,
    quotationController.getQuotation
  );

  // POST
  router.post(
    "/create",
    sessionController.loginRequired,
    quotationController.create
  );

  // PUT
  router.put(
    "/approval/:id",
    sessionController.loginRequired,
    quotationController.approval
  );

  router.put(
    "/:id/delete",
    sessionController.loginRequired,
    quotationController.changeState
  );

  router.put("/:id", sessionController.loginRequired, quotationController.edit);

  // DELETE
  router.delete(
    "/delete/:id",
    sessionController.loginRequired,
    quotationController.delete
  );

  app.use(mountPoint, router);
};
