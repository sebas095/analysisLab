const express = require('express');
const router = express.Router();
const {
  userController,
  sessionController,
  quotationController,
} = require('../controllers');

module.exports = (app, mountPoint) => {
  // GET
  router.get('/new', quotationController.new);

  // POST
  router.post('/create', quotationController.create);

  // PUT

  // DELETE

  app.use(mountPoint, router);
};
