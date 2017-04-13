const User = require('../models/user');

exports.loginRequired = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/session/login');
};

// Get /login  -- Login form
exports.new = (req, res) => {
  if (req.isAuthenticated())
    res.redirect('/profile');
  else
    res.render('session/new', {
      message: req.flash('loginMessage'),
    });
};

// GET /account/newPassword -- Request for new password
exports.newPassword = (req, res) => {
  res.render('session/newPassword');
};

// GET /account/recovery -- New password form
exports.recoveryPassword = (req, res) => {
  res.render('session/recovery');
};

// POST /account/emailRecovery
exports.sendEmail = (req, res) => {
  // TODO
  // send link /account/recovery
};

// POST /account/recovery -- Create new password form
exports.changePassword = (req, res) => {
  User.findByOneAndUpdate({
    email: req.body.email,
  }, req.body, {new: true}, (err, user) => {
    if (err) {
      console.log(err);
    } else if (user) {
      req.flash(
        'loginMessage',
        'Su contraseña ha sido actualizada exitosamente'
      );
      res.redirect(`/session/login`);
    } else {
      req.flash(
        'loginMessage',
        `La cuenta con el correo ${req.body.email} no se encuentra registrada`
      );
      res.redirect(`/session/login`);
    }
  });
};

// DELETE /logout -- Destroy session
exports.destroy = (req, res) => {
  req.logout();
  res.redirect('/');
};
