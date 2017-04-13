const express = require('express');
const router = express.Router();
const {sessionController} = require('../controllers');

module.exports = (app, mountPoint) => {
  // GET home page.
  router.get('/', (req, res) => res.render('index', {
    message: req.flash('indexMessage'),
  }));

  router.get('/profile', sessionController.loginRequired, (req, res) => {
    res.render('users/edit', {
      user: req.user,
      message: req.flash('userMessage'),
    });
  });

  app.use(mountPoint, router);
};
