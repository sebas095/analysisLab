const express = require('express');
const router = express.Router();
const {sessionController} = require('../controllers');

module.exports = (app, mountPoint) => {
  router.get('/recovery', sessionController.recoveryPassword);
  router.get('/newPassword', sessionController.newPassword);

  app.use(mountPoint, router);
};
