const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  }, (req, email, password, done) => {
    User.findOne({email: email}, (err, user) => {
      if (err)
        return done(err);

      if (!user)
        return done(
          null,
          false,
          req.flash('loginMessage', 'Usuario no encontrado.')
        );

      user.comparePassword(password, (err, isMatch) => {
        if (err) {
          return done(
            null,
            false,
            req.flash('loginMessage', 'Problemas para iniciar sesión')
          );
        } else if (!isMatch)
          return done(
            null,
            false,
            req.flash('loginMessage', 'La contraseña es incorrecta')
          );
        else {
          if (user.state === '0' || user.state === '3') {
            return done(
              null,
              false,
              req.flash('loginMessage', 'Su cuenta no esta activada')
            );
          }
          return done(null, user, req.flash('loginMessage', 'Bienvenido'));
        }
      });
    });
  }));
};
