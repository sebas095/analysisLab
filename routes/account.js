const express = require('express');
const router = express.Router();
const {sessionController} = require('../controllers');

module.exports = (app, mountPoint) => {
  // GET
  router.get('/recovery', sessionController.recoveryPassword);
  router.get('/newPassword', sessionController.newPassword);

  // POST
  router.post('/emailRecovery', sessionController.sendEmail);
  router.post('/recovery', sessionController.changePassword);

  app.use(mountPoint, router);
};
