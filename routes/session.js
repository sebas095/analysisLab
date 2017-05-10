const express = require('express');
const router = express.Router();
const {sessionController} = require('../controllers');

module.exports = (app, mountPoint, passport) => {
  // GET
  router.get('/login', sessionController.new);

  // POST
  router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/session/login',
    failureFlash: true,
  }));

  // DELETE
  router.delete('/logout', sessionController.destroy);

  app.use(mountPoint, router);
};
