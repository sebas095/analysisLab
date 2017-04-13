const express = require('express');
const router = express.Router();
const {sessionController} = require('../controllers');

module.exports = (app, mountPoint, passport) => {
  router.get('/login', sessionController.new);
  router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/session/login',
    failureFlash: true,
  }));
  router.delete('/logout', sessionController.destroy);

  app.use(mountPoint, router);
};
