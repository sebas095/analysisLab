const User = require('../models/user');
const {auth} = require('../config/email');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport(
  `smtps://${auth.user}:${auth.pass}@smtp.gmail.com`
);

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
  const {email} = req.body;
  User.findOne({email: email}, (err, user) => {
    if (err) console.log(err);
    else if (user) {
      const mailOptions = {
        from: 'Administración',
        to: user.email,
        subject: 'Recuperación de contraseña',
        html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},</p><br>
          Para una nueva contraseña deberás acceder a la siguiente dirección:
          <br><a href="${HOST}/account/recovery">Recuperar Contraseña</a>
          <br><br><br>Att,<br><br> Equipo Administrativo`,
      };

      transporter.sendMail(mailOptions, (err, res) => {
        if (err) console.log(err);
        req.flash(
          'loginMessage',
          'Revisa el correo para terminar la recuperación de contraseña'
        );
        res.redirect(`/session/login`);
      });
    } else {
      req.flash(
        'loginMessage',
        `La cuenta con el correo ${email} no se encuentra registrada`
      );
      res.redirect(`/session/login`);
    }
  });
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
