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

// GET /login -- Login form
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
  res.render('session/recovery', {message: req.flash('recoveryMessage')});
};

// POST /account/emailRecovery -- Send email for request a new password
exports.sendEmail = (req, res) => {
  const {email} = req.body;
  User.findOne({email: email}, (err, user) => {
    if (err) {
      console.log('Error: ', err);
      req.flash(
        'loginMessage',
        'Hubo problemas para iniciar sesión, intenta de nuevo'
      );
      return res.redirect('/session/login');
    } else if (user) {
      const id1 = user._id.slice(user._id.length / 2);
      const id2 = user._id.slice(0, user._id.length / 2);
      const mailOptions = {
        from: 'Administración',
        to: user.email,
        subject: 'Recuperación de contraseña',
        html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},</p><br>
          Para una nueva contraseña deberás acceder a la siguiente dirección:
          <br><a href="${HOST}/account/recovery/${id1}/${id2}">
          Recuperar Contraseña</a><br><br><br>Att,<br><br>
          Equipo Administrativo`,
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

// PUT /account/recovery -- Create new password form
exports.changePassword = (req, res) => {
  const id = reqp.param.id2 + req.params.id1;
  if (req.body.password !== req.body.cpassword) {
    req.flash('recoveryMessage', 'Las contraseñas no coinciden');
    res.redirect(req.originalUrl);
  } else {
    User.findByIdAndUpdate(id, {
      password: req.body.password,
    }, {new: true}, (err, user) => {
      if (err) {
        console.log('Error: ', err);
        req.flash(
          'loginMessage',
          'Hubo problemas para cambiar la contraseña, intenta de nuevo'
        );
        return res.redirect(req.originalUrl);
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
  }
};

// DELETE /logout -- Destroy session
exports.destroy = (req, res) => {
  req.logout();
  res.redirect('/');
};
