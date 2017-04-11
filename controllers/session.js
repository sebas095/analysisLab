// Get /login  -- Login form
exports.new = (req, res) => {
  res.render('session/new');
};

// POST /login -- Create the session
exports.create = (req, res) => {
  // TODO
};

// GET /account/newPassword -- Request for new password
exports.newPassword = (req, res) => {
  res.render('session/newPassword');
};

// GET /account/recovery -- New password form
exports.recoveryPassword = (req, res) => {
  res.render('session/recovery');
};

// POST /account/recovery -- Create new password form
exports.changePassword = (req, res) => {
  // TODO
};

// DELETE /logout -- Destroy session
exports.destroy = (req, res) => {
  // TODO
};
