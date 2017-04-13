const User = require('../models/user');

exports.createUser = (req, res) => {
  User.find({}, (err, users) => {
    if (err) console.log(err);
    else if (users.length === 0) {
      req.body.state = '1';
    } else {
      req.body.state = '0';
      req.flash(
        'registerMessage',
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

exports.updateUser = (req, res) => {
  const {id} = req.params;
  User.findByIdAndUpdate(id, req.body, {new: true}, (err, user) => {
    if (err) {
      console.log(err);
    } else if (req.originalUrl === '/users/admin') {
      req.flash('userMessage', 'Los datos han sido actualizados exitosamente');
      res.redirect('/users/admin');
    } else {
      req.flash('userMessage', 'Sus datos han sido actualizados exitosamente');
      res.redirect(`/users/${id}`);
    }
  });
};

exports.deleteUser = (req, res) => {
  const {id} = req.params;
  User.findByIdAndUpdate(id, req.body, {new: true}, (err, user) => {
    if (err) console.log(err);
    req.flash('userMessage', 'El estado de la cuenta ha sido actualizada');
    res.redirect('/users/admin');
  });
};

exports.getUsers = (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      console.log(err);
    } else if (users) {
      users = users.filter((user) => user._id !== req.user._id);
      res.render('users/admin', {users: users, user: req.user, message: ''});
    } else {
      req.flash('userMessage', 'No hay usuarios disponibles');
      res.redirect('/');
    }
  });
};

exports.DeactivatePendingAccount = (req, res) => {
  User.find({state: '4'}, (err, users) => {
    if (err) console.log(err);
    else if (users) {
      res.render('users/deactivate', {
        users: users,
        user: req.user,
        message: '',
      });
    } else {
      req.flash('userMessage', 'No hay usuarios disponibles');
      res.redirect('/');
    }
  });
};

exports.pendingUsers = (req, res) => {
  User.find({state: '0'}, (err, users) => {
    if (err) console.log(err);
    else if (users) {
      res.render('users/pending', {
        users: users,
        user: req.user,
        message: '',
      });
    } else {
      req.flash('userMessage', 'No hay usuarios disponibles');
      res.redirect('/');
    }
  });
};

exports.changeState = (req, res) => {
  const {id} = req.params;
  User.findByIdAndUpdate(id, {status: '4'}, {new: true}, (err, user) => {
    if (err) console.log(err);
    req.flash(
      'userMessage',
      'Pronto el administrador revisara tu solicitud ' +
      'y se te notificara por correo electrónico'
    );
    res.redirect(`/users/${id}`);
  });
};
