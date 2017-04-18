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
  router.get('/pending/approval', quotationController.pending);
  router.get('/pending/deactivate', quotationController.pendingDeactivate);
  router.get('/:id', quotationController.getQuotation);

  // POST
  router.post('/create', quotationController.create);

  // PUT
  router.put('/approval/:id', quotationController.approval);
  router.put('/deactivate/:id', quotationController.deactivate);
  router.put('/:id/deactivate', quotationController.changeState);
  router.put('/:id', quotationController.edit);

  // DELETE

  app.use(mountPoint, router);
};
