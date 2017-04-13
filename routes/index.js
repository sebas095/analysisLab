const express = require('express');
const router = express.Router();
const {sessionController} = require('../controllers');
const {auth} = require('../config/email');
// const nodemailer = require('nodemailer');
// const transporter = nodemailer.createTransport(
//   `smtps://${auth.user}:${auth.pass}@smtp.gmail.com`
// );

module.exports = (app, mountPoint) => {
  // GET home page.
  router.get('/', function(req, res, next) {
    // transporter.sendMail(mailOptions, (err, res) => {
    //   if (err) console.log(err);
    // });
    res.render('index', {title: 'Express'});
  });

  router.get('/profile', sessionController.loginRequired, (req, res) => {
    res.render('users/edit', {user: req.user});
  });

  app.use(mountPoint, router);
};
