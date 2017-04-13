const express = require('express');
const router = express.Router();
const {userController, sessionController} = require('../controllers');

module.exports = (app, mountPoint) => {
  // GET users listing.
  router.get('/', sessionController.loginRequired, userController.getUsers);
  router.get('/register', userController.newUser);

  app.use(mountPoint, router);
};
