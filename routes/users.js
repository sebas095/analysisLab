const express = require('express');
const router = express.Router();
const {userController, sessionController} = require('../controllers');

module.exports = (app, mountPoint) => {
  // GET
  router.get('/', sessionController.loginRequired, userController.getUsers);
  router.get('/register', userController.newUser);
  router.get('/users/pending/approve', sessionController.loginRequired, userController.pendingUsers);
  router.get('/users/pending/deactivate', sessionController.loginRequired, userController.deactivatePendingAccount);

  // POST
  router.post('/users/register', userController.createUser);

  // PUT
  router.put('/users/:id', sessionController.loginRequired, userController.updateUser);
  router.put('/users/accountApproval', sessionController.loginRequired, userController.accountApproval);
  router.put('/users/deactivateAccount', sessionController.loginRequired, userController.deactivateAccount);

  // DELETE
  router.delete('/users/:id', sessionController.loginRequired, userController.deleteUser);

  app.use(mountPoint, router);
};
