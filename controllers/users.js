const User = require('../models/user');
const {auth} = require('../config/email');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport(
  `smtps://${auth.user}:${auth.pass}@smtp.gmail.com`
);

// GET /users/register -- Register form
exports.newUser = (req, res) => {
  if (!req.isAuthenticated()) {
    User.find({}, (err, users) => {
      if (err) {
        console.log('Error: ', err);
        req.flash(
          'indexMessage',
          'Hubo problemas con el servidor, intenta de nuevo'
        );
        return res.redirect('/');
      } else if (users.length === 0) {
        res.render('users/new', {isAdmin: true});
      } else {
        res.render('users/new', {isAdmin: false});
      }
    });
  } else {
    res.redirect('/profile');
  }
};

// POST /users/register -- Create a new user
exports.createUser = (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      console.log('Error: ', err);
      req.flash(
        'indexMessage',
        'Hubo problemas en el registro, intenta de nuevo'
      );
      return res.redirect('/');
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

    if (req.body.status === 'admin') {
      req.body.state = '5';
      delete req.body.status;
    }

    User.create(req.body, (err, user) => {
      if (err) {
        console.log(err);
        req.flash(
          'indexMessage',
          'Hubo problemas en el registro, intenta de nuevo'
        );
        return res.redirect('/');
      }
      res.redirect(`/`);
    });
  });
};

// PUT /users/:id -- Modifies user data
exports.updateUser = (req, res) => {
  const id = req.params.id || req.user._id;
  if (req.body.status && req.body.status === 'admin') {
    req.body.state = '1';
  } else {
    req.body.state = '2';
  }

  User.findByIdAndUpdate(id, req.body, {new: true}, (err, user) => {
    if (err) {
      console.log('Error: ', err);
      req.flash(
        'indexMessage',
        'Hubo problemas actualizando los datos, intenta de nuevo'
      );
      return res.redirect('/');
    } else if (req.originalUrl.includes('/users/')) {
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
  if (req.user.state.includes('1')) {
    const {id} = req.params;
    User.findByIdAndUpdate(id, {
      state: req.body.status,
    }, {new: true}, (err, user) => {
      if (err) {
        console.log(err);
        req.flash(
          'indexMessage',
          'Hubo problemas desactivando la cuenta, intenta de nuevo'
        );
        return res.redirect('/');
      }
      req.flash('adminMessage', 'El estado de la cuenta ha sido actualizada');
      res.redirect('/users/admin');
    });
  } else {
    res.redirect('/');
  }
};

// GET /users/admin -- Return all the users
exports.getUsers = (req, res) => {
  if (req.user.state.includes('1')) {
    User.find({
     $or: [
       {state: '1'},
       {state: '2'},
       {state: '3'},
       {state: '4'},
     ],
      _id: {$ne: req.user._id},
    }, (err, users) => {
      if (err) {
        console.log('Error: ', err);
        req.flash(
          'indexMessage',
          'Hubo problemas obteniendo los datos de los usuarios, ' +
          'intenta de nuevo'
        );
        res.redirect('/');
      } else if (users.length > 0) {
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
  } else {
    req.flash('indexMessage', 'No tienes permisos para acceder');
    res.redirect('/');
  }
};

// GET /users/pending/deactive -- Users with pending account for deactivate
exports.deactivatePendingAccount = (req, res) => {
  if (req.user.state.includes('1')) {
    User.find({state: '4'}, (err, users) => {
      if (err) {
        console.log('Error: ', err);
        req.flash(
          'indexMessage',
          'Hubo problemas obteniendo los datos de los usuarios, ' +
          'intenta de nuevo'
        );
        res.redirect('/');
      } else if (users.length > 0) {
        res.render('users/deactivate', {
          users: users,
          user: req.user,
          message: req.flash('pendingDeactivateUsers'),
        });
      } else {
        req.flash(
          'indexMessage',
          'No hay usuarios disponibles para la desactivación de cuentas'
        );
        res.redirect('/');
      }
    });
  } else {
    req.flash('indexMessage', 'No tienes permisos para acceder');
    res.redirect('/');
  }
};

// GET /users/pending/approve -- Users with pending account for approve
exports.pendingUsers = (req, res) => {
  if (req.user.state.includes('1')) {
    User.find({$or: [
      {state: '0'},
      {state: '5'},
    ]}, (err, users) => {
      if (err) {
        console.log('Error: ', err);
        req.flash(
          'indexMessage',
          'Hubo problemas obteniendo los datos de los usuarios, ' +
          'intenta de nuevo'
        );
        res.redirect('/');
      } else if (users.length > 0) {
        res.render('users/pending', {
          users: users,
          user: req.user,
          message: req.flash('pendingUsers'),
        });
      } else {
        req.flash(
          'indexMessage',
          'No hay usuarios disponibles para la aprobación de cuentas'
        );
        res.redirect('/');
      }
    });
  } else {
    req.flash('indexMessage', 'No tienes permisos para acceder');
    res.redirect('/');
  }
};

// PUT /users/:id/deactiveAccount -- Request for deactivate account
exports.changeState = (req, res) => {
  const {id} = req.params;
  User.findByIdAndUpdate(id, {state: '4'}, {new: true}, (err, user) => {
    if (err) {
      console.log(err);
      req.flash(
        'indexMessage',
        'Hubo problemas desactivando la cuenta del usuario'
      );
      return res.redirect('/');
    }
    req.flash(
      'userMessage',
      'Pronto el administrador revisara tu solicitud ' +
      `y se te notificara al correo electrónico de ${user.email}`
    );
    res.redirect(`/profile`);
  });
};

// PUT /users/accountApproval -- Users account approval
exports.accountApproval = (req, res) => {
  if (req.user.state.includes('1')) {
    const {email} = req.body;
    let status;

    if (req.body.account === 'accept') {
      if (req.body.status === 'admin') {
        status = '1';
      } else {
        status = '2';
      }

      User.findOneAndUpdate({
        email: email,
      }, {state: status, rol: req.body.rol}, {new: true}, (err, user) => {
        if (err) {
          console.log('Error: ', err);
          req.flash(
            'indexMessage',
            'Hubo problemas aprobando la cuenta del usuario'
          );
          res.redirect('/');
        } else if (user) {
          const mailOptions = {
            from: 'Administración',
            to: user.email,
            subject: 'Estado de aprobación de cuenta',
            html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},</p>
            <br>Se le informa que su cuenta ha sido aprobada, si deseas ingresar
            ve a la siguiente dirección:<br><a href="${HOST}/session/login">
            Iniciar sesión</a><br><br><br>Att,<br><br>
            Equipo Administrativo`,
          };

          transporter.sendMail(mailOptions, (err) => {
            if (err) console.log(err);
            res.redirect('/users/pending/approve');
          });
        } else {
          req.flash(
            'pendingUsers',
            `No existe el usuario con el correo ${email}`
          );
          res.redirect('/users/pending/approve');
        }
      });
    } else {
      User.findOneAndRemove({email: email}, (err, user) => {
        if (err) {
          console.log('Error: ', err);
          req.flash(
            'indexMessage',
            'Hubo problemas rechazando la cuenta del usuario'
          );
          res.redirect('/');
        } else if (user) {
          const mailOptions = {
            from: 'Administración',
            to: user.email,
            subject: 'Estado de aprobación de cuenta',
            html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},</p>
            <br>Se le informa que su cuenta ha sido rechazada.<br><br><br>
            Att,<br><br>Equipo Administrativo`,
          };

          transporter.sendMail(mailOptions, (err) => {
            if (err) console.log(err);
            res.redirect('/users/pending/approve');
          });
        } else {
          req.flash(
            'pendingUsers',
            `No existe el usuario con el correo ${email}`
          );
          res.redirect('users/accountApproval');
        }
      });
    }
  } else {
    req.flash('indexMessage', 'No tienes permisos para acceder');
    res.redirect('/');
  }
};

// PUT /users/deactivateAccount -- Users deactivate account
exports.deactivateAccount = (req, res) => {
  if (req.user.state.includes('1')) {
    const {email} = req.body;
    if (req.body.account === 'accept') {
      User.findOneAndUpdate({
        email: email,
      }, {state: '3'}, {new: true}, (err, user) => {
        if (err) {
          console.log('Error: ', err);
          req.flash(
            'indexMessage',
            'Hubo problemas desactivando la cuenta del usuario'
          );
          res.redirect('/');
        } else if (user) {
          const mailOptions = {
            from: 'Administración',
            to: user.email,
            subject: 'Desactivación de cuenta',
            html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},</p>
            <br>Se le informa que su cuenta ha sido desactivada exitosamente.
            <br><br><br>Att,<br><br>Equipo Administrativo`,
          };

          transporter.sendMail(mailOptions, (err) => {
            if (err) console.log(err);
            res.redirect('/users/pending/deactivate');
          });
        } else {
          req.flash(
            'pendingDeactivateUsers',
            `No existe el usuario con el correo ${email}`
          );
          res.redirect('/users/pending/deactivate');
        }
      });
    } else {
        User.findOneAndUpdate({
          email: email,
        }, {state: '2'}, {new: true}, (err, user) => {
          if (err) {
            console.log('Error: ', err);
            req.flash(
              'indexMessage',
              'Hubo problemas con la cuenta del usuario'
            );
            res.redirect('/');
          } else if (user) {
            const mailOptions = {
              from: 'Administración',
              to: user.email,
              subject: 'Desactivación de cuenta',
              html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},</p>
              <br>Se le informa que su cuenta no ha sido desactivada.
              <br><br><br>Att,<br><br>Equipo Administrativo`,
            };

            transporter.sendMail(mailOptions, (err) => {
              if (err) console.log(err);
              res.redirect('/users/pending/deactivate');
            });
          } else {
            req.flash(
              'pendingDeactivateUsers',
              `No existe el usuario con el correo ${email}`
            );
            res.redirect('/users/pending/deactivate');
          }
      });
    }
  } else {
    req.flash('indexMessage', 'No tienes permisos para acceder');
    res.redirect('/');
  }
};
