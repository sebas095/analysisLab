const User = require("../models/user");
const { auth } = require("../config/email");
const crypto = require("crypto");
const async = require("async");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport(
  `smtps://${auth.user}:${auth.pass}@smtp.gmail.com`
);

exports.loginRequired = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/session/login");
};

// GET /login -- Login form
exports.new = (req, res) => {
  if (req.isAuthenticated())
    res.redirect("/profile");
  else
    res.render("session/new", {
      message: req.flash("loginMessage")
    });
};

// GET /account/newPassword -- Request for new password
exports.newPassword = (req, res) => {
  res.render("session/newPassword", { message: req.flash("error") });
};

// GET /account/recovery/:token -- New password form
exports.recoveryPassword = (req, res) => {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    },
    (err, user) => {
      if (!user) {
        req.flash(
          "error",
          "El token para resetear la contraseña " +
            "es invalido o ya ha expirado"
        );
        res.redirect("/account/newPassword");
      }
      res.render("session/recovery", {
        token: req.params.token,
        message: req.flash("recoveryMessage")
      });
    }
  );
};

// POST /account/emailRecovery -- Send email for request a new password
exports.sendEmail = (req, res) => {
  const { email } = req.body;
  async.waterfall(
    [
      done => {
        crypto.randomBytes(30, (err, buf) => {
          const token = buf.toString("hex");
          done(err, token);
        });
      },
      (token, done) => {
        User.findOne({ email: email }, (err, user) => {
          if (err) {
            console.log("Error: ", err);
            req.flash(
              "loginMessage",
              "Hubo problemas para iniciar sesión, intenta de nuevo"
            );
            return res.redirect("/session/login");
          } else if (!user) {
            req.flash(
              "loginMessage",
              `La cuenta con el correo ${email} no se encuentra registrada`
            );
            return res.redirect("/session/login");
          } else {
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            user.save(err => {
              done(err, token, user);
            });
          }
        });
      },
      (token, user, done) => {
        const mailOptions = {
          from: "Administración",
          to: user.email,
          subject: "Recuperación de contraseña",
          html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},</p><br>
          Para una nueva contraseña deberás acceder a la siguiente dirección:
          <br><a href="${HOST}/account/recovery/${token}">
          Recuperar Contraseña</a><br><br>Si usted no lo solicitó, ignore
          este correo electrónico y su contraseña permanecerá sin cambios.
          <br><br><br>Att,<br><br>Equipo Administrativo`
        };

        transporter.sendMail(mailOptions, err => {
          if (err) console.log(err);
          req.flash(
            "loginMessage",
            `Revisa el correo ${user.email} para completar
          la recuperación de contraseña`
          );
          done(err, "done");
        });
      }
    ],
    err => {
      if (err) console.log(err);
      res.redirect("/session/login");
    }
  );
};

// PUT /account/recovery/:token -- Create new password form
exports.changePassword = (req, res) => {
  const token = req.params.token;
  if (req.body.password !== req.body.cpassword) {
    req.flash("recoveryMessage", "Las contraseñas no coinciden");
    res.redirect(`/account/recovery/${token}`);
  } else {
    User.findOne(
      {
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      },
      (err, usr) => {
        if (err) {
          console.log("Error: ", err);
          req.flash(
            "recoveryMessage",
            "Hubo problemas para cambiar la contraseña, intenta de nuevo"
          );
          return res.redirect(`/account/recovery/${token}`);
        }
        usr.comparePassword(req.body.password, (err, isMatch) => {
          if (err) {
            console.log("Error: ", err);
            req.flash(
              "recoveryMessage",
              "Hubo problemas para cambiar la contraseña, intenta de nuevo"
            );
            return res.redirect(`/account/recovery/${token}`);
          } else if (isMatch) {
            req.flash(
              "recoveryMessage",
              "Esa contraseña era la que tenias anteriormente, " +
                "por favor intenta de nuevo con otra contraseña"
            );
            return res.redirect(`/account/recovery/${token}`);
          } else {
            async.waterfall(
              [
                done => {
                  bcrypt.genSalt(10, (err, salt) => {
                    if (err) return done(err, salt);
                    done(null, salt);
                  });
                },
                (salt, done) => {
                  bcrypt.hash(req.body.password, salt, (err, hash) => {
                    if (err) return done(err);
                    req.body.password = hash;
                    done(null, req.body.password);
                  });
                },
                (password, done) => {
                  User.findOneAndUpdate(
                    {
                      resetPasswordToken: token,
                      resetPasswordExpires: { $gt: Date.now() }
                    },
                    { password: password },
                    { new: true },
                    (err, user) => {
                      if (err) {
                        console.log("Error: ", err);
                        return done(err);
                      } else if (user) {
                        req.flash(
                          "loginMessage",
                          "Su contraseña ha sido actualizada exitosamente"
                        );
                        done(null, "done");
                      } else {
                        req.flash(
                          "loginMessage",
                          `La cuenta con el correo ${req.body.email} no se ` +
                            "encuentra registrada o el token ha expirado, " +
                            "intenta de nuevo"
                        );
                        done(null, "done");
                      }
                    }
                  );
                }
              ],
              err => {
                if (err) {
                  req.flash(
                    "recoveryMessage",
                    "Hubo problemas para cambiar la contraseña," +
                      " intenta de nuevo"
                  );
                  return res.redirect(`/account/recovery/${token}`);
                }
                res.redirect("/session/login");
              }
            );
          }
        });
      }
    );
  }
};

// DELETE /logout -- Destroy session
exports.destroy = (req, res) => {
  req.logout();
  delete req.session.passport;
  res.redirect("/");
};
