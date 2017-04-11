const express = require('express');
const router = express.Router();

module.exports = (app, mountPoint) => {
  // GET users listing.
  router.get('/', (req, res, next) => {
    res.send('respond with a resource');
  });

  app.use(mountPoint, router);
};
