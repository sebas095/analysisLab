const express = require('express');
const router = express.Router();
const {userController, sessionController} = require('../controllers');

module.exports = (app, mountPoint) => {
  // GET
  router.get('/', sessionController.loginRequired, userController.getUsers);
  router.get('/register', userController.newUser);
  router.get('/pending/approve', sessionController.loginRequired, userController.pendingUsers);
  router.get('/pending/deactivate', sessionController.loginRequired, userController.deactivatePendingAccount);

  // POST
  router.post('/register', userController.createUser);

  // PUT
  router.put('/:id', sessionController.loginRequired, userController.updateUser);
  router.put('/accountApproval', sessionController.loginRequired, userController.accountApproval);
  router.put('/deactivateAccount', sessionController.loginRequired, userController.deactivateAccount);

  // DELETE
  router.delete('/:id', sessionController.loginRequired, userController.deleteUser);

  app.use(mountPoint, router);
};
