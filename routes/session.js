const express = require('express');
const router = express.Router();
const {sessionController} = require('../controllers');

module.exports = (app, mountPoint) => {
  router.get('/login', sessionController.new);

  app.use(mountPoint, router);
};
