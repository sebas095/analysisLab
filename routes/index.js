const express = require('express');
const router = express.Router();

module.exports = (app, mountPoint) => {
  // GET home page.
  router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

  app.use(mountPoint, router);
}
