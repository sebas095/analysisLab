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
  router.get('/search', quotationController.search);
  router.get('/pending/approval', quotationController.pending);
  router.get('/pending/delete', quotationController.pendingDelete);
  router.get('/:id', quotationController.getQuotation);

  // POST
  router.post('/create', quotationController.create);
  router.post('/search', quotationController.find);

  // PUT
  router.put('/approval/:id', quotationController.approval);
  router.put('/delete/:id', quotationController.delete);
  router.put('/:id/delete', quotationController.changeState);
  router.put('/:id', quotationController.edit);

  // DELETE

  app.use(mountPoint, router);
};
