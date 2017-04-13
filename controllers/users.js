const User = require('../models/user');
const {auth} = require('../config/email');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport(
  `smtps://${auth.user}:${auth.pass}@smtp.gmail.com`
);

// GET /users/register -- Register form
exports.newUser = (req, res) => {
  res.render('users/new');
};

// POST /users/register -- Create a new user
exports.createUser = (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      console.log('Error: ', err);
      return res.send(500, err);
    } else if (users.length === 0) {
      req.body.state = '1';
    } else {
      req.body.state = '0';
      req.flash(
        'indexMessage',
        'Pronto el administrador revisara tu solicitud de cuenta ' +
        'y se te notificara por correo electrónico'
      );
    }

    User.create(req.body, (err, user) => {
      if (err) console.log(err);
      res.redirect(`/`);
    });
  });
};

// PUT /users/:id -- Modifies user data
exports.updateUser = (req, res) => {
  const id = req.params.id || req.user._id;
  User.findByIdAndUpdate(id, req.body, {new: true}, (err, user) => {
    if (err) {
      console.log('Error: ', err);
      return res.send(500, err);
    } else if (req.originalUrl === '/users/admin') {
      req.flash('adminMessage', 'Los datos han sido actualizados exitosamente');
      res.redirect('/users/admin');
    } else {
      req.flash('userMessage', 'Sus datos han sido actualizados exitosamente');
      res.redirect(`/profile`);
    }
  });
};

// DELETE /users/:id -- Deactivate user account
exports.deleteUser = (req, res) => {
  const {id} = req.params;
  User.findByIdAndUpdate(id, {
    status: req.body.status,
  }, {new: true}, (err, user) => {
    if (err) console.log(err);
    req.flash('adminMessage', 'El estado de la cuenta ha sido actualizada');
    res.redirect('/users/admin');
  });
};

// GET /users -- Return all the users
exports.getUsers = (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      console.log('Error: ', err);
      return res.send(500, err);
    } else if (users) {
      users = users.filter((user) => user._id !== req.user._id);
      res.render('users/admin', {
        users: users,
        user: req.user,
        message: req.flash('adminMessage'),
      });
    } else {
      req.flash('indexMessage', 'No hay usuarios disponibles');
      res.redirect('/');
    }
  });
};

// GET /users/pending/deactive -- Users with pending account for deactivate
exports.deactivatePendingAccount = (req, res) => {
  User.find({state: '4'}, (err, users) => {
    if (err) {
      console.log('Error: ', err);
      return res.send(500, err);
    } else if (users) {
      res.render('users/deactivate', {
        users: users,
        user: req.user,
        message: req.flash('pendingDeactivateUsers'),
      });
    } else {
      req.flash('indexMessage', 'No hay usuarios disponibles');
      res.redirect('/');
    }
  });
};

// GET /users/pending/approve -- Users with pending account for approve
exports.pendingUsers = (req, res) => {
  User.find({state: '0'}, (err, users) => {
    if (err) {
      console.log('Error: ', err);
      return res.send(500, err);
    } else if (users) {
      res.render('users/pending', {
        users: users,
        user: req.user,
        message: req.flash('pendingUsers'),
      });
    } else {
      req.flash('indexMessage', 'No hay usuarios disponibles');
      res.redirect('/');
    }
  });
};

// PUT /users/:id/deactiveAccount -- Request for deactivate account
exports.changeState = (req, res) => {
  const {id} = req.params;
  User.findByIdAndUpdate(id, {status: '4'}, {new: true}, (err, user) => {
    if (err) console.log(err);
    req.flash(
      'userMessage',
      'Pronto el administrador revisara tu solicitud ' +
      'y se te notificara por correo electrónico'
    );
    res.redirect(`/profile`);
  });
};

// PUT /users/accountApproval -- Users account approval
exports.accountApproval = (req, res) => {
  const {email} = req.body;
  if (req.body.account === 'accept') {
    User.findByOneAndUpdate({
      email: email,
    }, {status: '2'}, {new: true}, (err, user) => {
      if (err) {
        console.log('Error: ', err);
        return res.send(500, err);
      } else if (user) {
        const mailOptions = {
          from: 'Administración',
          to: user.email,
          subject: 'Estado de aprobación de cuenta',
          html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},</p><br>
            Se le informa que su cuenta ha sido aprobada, si deseas ingresar
            ve a la siguiente dirección:<br><a href="${HOST}/session/login">
            Iniciar sesión</a><br><br><br>Att,<br><br>
            Equipo Administrativo`,
        };

        transporter.sendMail(mailOptions, (err, res) => {
          if (err) console.log(err);
          res.redirect(req.originalUrl);
        });
      } else {
        req.flash(
          'pendingUsers',
          `No existe el usuario con el correo ${email}`
        );
        res.redirect(req.originalUrl);
      }
    });
  } else {
    User.findOneAndRemove({email: email}, (err, user) => {
      if (err) {
        console.log('Error: ', err);
        return res.send(500, err);
      } else if (user) {
        const mailOptions = {
          from: 'Administración',
          to: user.email,
          subject: 'Estado de aprobación de cuenta',
          html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},</p><br>
            Se le informa que su cuenta ha sido rechazada.<br><br><br>
            Att,<br><br>Equipo Administrativo`,
        };

        transporter.sendMail(mailOptions, (err, res) => {
          if (err) console.log(err);
          res.redirect(req.originalUrl);
        });
      } else {
        req.flash(
          'pendingUsers',
          `No existe el usuario con el correo ${email}`
        );
        res.redirect(req.originalUrl);
      }
    });
  }
};

// PUT /users/deactivateAccount -- Users deactivate account
exports.deactivateAccount = (req, res) => {
  const {email} = req.body;
  if (req.body.account === 'accept') {
    User.findByOneAndUpdate({
      email: email,
    }, {status: '3'}, {new: true}, (err, user) => {
      if (err) {
        console.log('Error: ', err);
        return res.send(500, err);
      } else if (user) {
        const mailOptions = {
          from: 'Administración',
          to: user.email,
          subject: 'Desactivación de cuenta',
          html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},</p><br>
            Se le informa que su cuenta ha sido desactivada exitosamente.
            <br><br><br>Att,<br><br>Equipo Administrativo`,
        };

        transporter.sendMail(mailOptions, (err, res) => {
          if (err) console.log(err);
          res.redirect(req.originalUrl);
        });
      } else {
        req.flash(
          'pendingDeactivateUsers',
          `No existe el usuario con el correo ${email}`
        );
        res.redirect(req.originalUrl);
      }
    });
  } else {
    User.findByOneAndUpdate({
      email: email,
    }, {status: '2'}, {new: true}, (err, user) => {
      if (err) {
        console.log('Error: ', err);
        return res.send(500, err);
      } else if (user) {
        const mailOptions = {
          from: 'Administración',
          to: user.email,
          subject: 'Desactivación de cuenta',
          html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},</p><br>
            Se le informa que su cuenta no ha sido desactivada.
            <br><br><br>Att,<br><br>Equipo Administrativo`,
        };

        transporter.sendMail(mailOptions, (err, res) => {
          if (err) console.log(err);
          res.redirect(req.originalUrl);
        });
      } else {
        req.flash(
          'pendingDeactivateUsers',
          `No existe el usuario con el correo ${email}`
        );
        res.redirect(req.originalUrl);
      }
    });
  }
};
