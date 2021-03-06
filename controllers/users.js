const User = require("../models/user");
const { auth } = require("../config/email");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport(
  `smtps://${auth.user}:${auth.pass}@smtp.gmail.com`
);

// GET /users/register -- Register form
exports.newUser = (req, res) => {
  if (!req.isAuthenticated()) {
    User.find({}, (err, users) => {
      if (err) {
        console.log("Error: ", err);
        req.flash(
          "indexMessage",
          "Hubo problemas con el servidor, intenta de nuevo"
        );
        return res.redirect("/labaguasyalimentos");
      } else if (users.length === 0) {
        res.render("users/new");
      } else {
        res.render("users/new");
      }
    });
  } else {
    res.redirect("/labaguasyalimentos/profile");
  }
};

// POST /users/register -- Create a new user
exports.createUser = (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      console.log("Error: ", err);
      req.flash(
        "indexMessage",
        "Hubo problemas en el registro, intenta de nuevo"
      );
      return res.redirect("/labaguasyalimentos");
    } else if (users.length === 0) {
      req.body.state = "1";
    } else {
      req.body.state = "0";
    }

    User.create(req.body, (err, user) => {
      if (err) {
        console.log(err);
        req.flash(
          "loginMessage",
          "Hubo problemas en el registro, intenta de nuevo"
        );
        return res.redirect("/labaguasyalimentos/session/login");
      }
      User.find({ state: "1" }, (err, users) => {
        if (err) {
          console.log(err);
          req.flash(
            "loginMessage",
            "Hubo problemas en el registro, intenta de nuevo"
          );
          return res.redirect("/labaguasyalimentos/session/login");
        } else if (users.length > 0) {
          let emails = "";
          for (let i = 0; i < users.length; i++) {
            if (i > 0) emails += ",";
            emails += users[i].email;
          }

          const mailOptions = {
            from: "Administración",
            to: emails,
            subject: "Aprobación de cuentas",
            html: `<p>Estimado Usuario administrador,</p><br>Se le informa que
              hay cuentas pendientes para aprobar o rechazar. Si desea ingresar de
               clic en el siguiente enlace:<br>
               <a href="${HOST}/users/pending/approve">Iniciar sesión</a>
               <br><br><br>Att,<br><br>Equipo Administrativo`
          };

          transporter.sendMail(mailOptions, err => {
            if (err) console.log(err);
            if (req.body.state === "0") {
              req.flash(
                "loginMessage",
                "Pronto el administrador revisara su solicitud de cuenta " +
                  "y se le notificara por correo electrónico"
              );
            } else {
              req.flash(
                "loginMessage",
                "La cuenta ha sido creada exitosamente " +
                  "y tienes permisos de administrador"
              );
            }
            res.redirect("/labaguasyalimentos/session/login");
          });
        } else {
          req.flash("loginMessage", "Hubo problemas en el servidor");
          res.redirect("/labaguasyalimentos/session/login");
        }
      });
    });
  });
};

// PUT /users/:id -- Modifies user data
exports.updateUser = (req, res) => {
  if (req.user.state.includes("1")) {
    const { id, rol } = req.params;

    if (rol === "admin-user") {
      if (req.body[`status-${id}`]) {
        req.body.state = "1";
      } else {
        req.body.state = "2";
      }
    }

    User.findByIdAndUpdate(id, req.body, { new: true }, (err, user) => {
      if (err) {
        console.log("Error: ", err);
        req.flash(
          "indexMessage",
          "Hubo problemas actualizando los datos, intenta de nuevo"
        );
        return res.redirect("/labaguasyalimentos");
      } else {
        req.flash(
          "adminMessage",
          "Los datos han sido actualizados exitosamente"
        );
        res.redirect("/labaguasyalimentos/users/admin");
      }
    });
  } else {
    res.redirect("/labaguasyalimentos");
  }
};

// PUT /profile -- Modifies user data
exports.updateProfile = (req, res) => {
  const id = req.user._id;

  User.findByIdAndUpdate(id, req.body, { new: true }, (err, user) => {
    if (err) {
      console.log("Error: ", err);
      req.flash(
        "indexMessage",
        "Hubo problemas actualizando los datos, intenta de nuevo"
      );
      return res.redirect("/labaguasyalimentos");
    } else {
      req.flash("userMessage", "Sus datos han sido actualizados exitosamente");
      res.redirect("/labaguasyalimentos/profile");
    }
  });
};

// DELETE /users/:id -- Deactivate user account
exports.deleteUser = (req, res) => {
  if (req.user.state.includes("1")) {
    const { id } = req.params;
    User.findByIdAndUpdate(
      id,
      {
        state: req.body.status
      },
      { new: true },
      (err, user) => {
        if (err) {
          console.log(err);
          req.flash(
            "indexMessage",
            "Hubo problemas desactivando la cuenta, intenta de nuevo"
          );
          return res.redirect("/labaguasyalimentos");
        }
        req.flash("adminMessage", "El estado de la cuenta ha sido actualizada");
        res.redirect("/labaguasyalimentos/users/admin");
      }
    );
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
  }
};

// GET /users/admin -- Return all the users
exports.getUsers = (req, res) => {
  if (req.user.state.includes("1")) {
    User.find(
      {
        $or: [{ state: "1" }, { state: "2" }, { state: "3" }],
        _id: { $ne: req.user._id }
      },
      (err, users) => {
        if (err) {
          console.log("Error: ", err);
          req.flash(
            "indexMessage",
            "Hubo problemas obteniendo los datos de los usuarios, " +
              "intenta de nuevo"
          );
          res.redirect("/labaguasyalimentos");
        } else if (users.length > 0) {
          res.render("users/admin", {
            users: users,
            user: req.user,
            message: req.flash("adminMessage")
          });
        } else {
          req.flash("indexMessage", "No hay usuarios disponibles");
          res.redirect("/labaguasyalimentos");
        }
      }
    );
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
  }
};

// GET /users/pending/deactive -- Users with pending account for deactivate
exports.deactivatePendingAccount = (req, res) => {
  if (req.user.state.includes("1")) {
    User.find({ state: "4" }, (err, users) => {
      if (err) {
        console.log("Error: ", err);
        req.flash(
          "indexMessage",
          "Hubo problemas obteniendo los datos de los usuarios, " +
            "intenta de nuevo"
        );
        res.redirect("/labaguasyalimentos");
      } else if (users.length > 0) {
        res.render("users/deactivate", {
          users: users,
          user: req.user,
          message: req.flash("pendingDeactivateUsers")
        });
      } else {
        req.flash(
          "indexMessage",
          "No hay más usuarios disponibles para la desactivación de cuentas"
        );
        res.redirect("/labaguasyalimentos");
      }
    });
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
  }
};

// GET /users/pending/approve -- Users with pending account for approve
exports.pendingUsers = (req, res) => {
  if (req.user.state.includes("1")) {
    User.find(
      {
        $or: [{ state: "0" }, { state: "5" }]
      },
      (err, users) => {
        if (err) {
          console.log("Error: ", err);
          req.flash(
            "indexMessage",
            "Hubo problemas obteniendo los datos de los usuarios, " +
              "intenta de nuevo"
          );
          res.redirect("/labaguasyalimentos");
        } else if (users.length > 0) {
          res.render("users/pending", {
            users: users,
            user: req.user,
            message: req.flash("pendingUsers")
          });
        } else {
          req.flash(
            "indexMessage",
            "No hay más usuarios disponibles para la aprobación de cuentas"
          );
          res.redirect("/labaguasyalimentos");
        }
      }
    );
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
  }
};

// PUT /users/:id/deactiveAccount -- Request for deactivate account
exports.changeState = (req, res) => {
  const { id } = req.params;
  User.findByIdAndUpdate(id, { state: "4" }, { new: true }, (err, user) => {
    if (err) {
      console.log(err);
      req.flash(
        "indexMessage",
        "Hubo problemas en la solicitud de desactivación de la cuenta"
      );
      return res.redirect("/labaguasyalimentos");
    }
    User.find({ state: "1" }, (err, users) => {
      if (err) {
        console.log(err);
        req.flash(
          "indexMessage",
          "Hubo problemas para notificar al administrador"
        );
        return res.redirect("/labaguasyalimentos");
      } else if (users.length > 0) {
        let emails = "";
        for (let i = 0; i < users.length; i++) {
          if (i > 0) emails += ",";
          emails += users[i].email;
        }

        const mailOptions = {
          from: "Administración",
          to: emails,
          subject: "Desactivación de cuentas",
          html: `<p>Estimado Usuario administrador,</p><br>Se le informa que
            hay solicitudes para la desactivación de cuentas, para aprobar
            o rechazar. Si desea ingresar de clic en el siguiente enlace:<br>
            <a href="${HOST}/users/pending/deactivate">Iniciar sesión</a>
            <br><br><br>Att,<br><br>Equipo Administrativo`
        };

        transporter.sendMail(mailOptions, err => {
          if (err) console.log(err);
          req.flash(
            "userMessage",
            "Pronto el administrador revisara su solicitud " +
              `y se le notificara al correo electrónico de ${user.email}`
          );
          res.redirect("/labaguasyalimentos/profile");
        });
      } else {
        req.flash("indexMessage", "No hay administradores disponibles");
        res.redirect("/labaguasyalimentos");
      }
    });
  });
};

// PUT /users/accountApproval -- Users account approval
exports.accountApproval = (req, res) => {
  if (req.user.state.includes("1")) {
    const { email } = req.body;
    let status;

    if (req.body.account === "accept") {
      if (req.body.status === "admin") {
        status = "1";
      } else {
        status = "2";
      }

      User.findOneAndUpdate(
        {
          email: email
        },
        { state: status, rol: req.body.rol },
        { new: true },
        (err, user) => {
          if (err) {
            console.log("Error: ", err);
            req.flash(
              "indexMessage",
              "Hubo problemas notificando la aprobación de cuenta del usuario"
            );
            res.redirect("/labaguasyalimentos");
          } else if (user) {
            const mailOptions = {
              from: "Administración",
              to: user.email,
              subject: "Estado de aprobación de cuenta",
              html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},</p>
              <br>Se le informa que su cuenta ha sido aprobada.
                Si desea ingresar de clic en el siguiente enlace:<br>
                <a href="${HOST}/session/login">Iniciar sesión</a><br><br><br>
                Att,<br><br>Equipo Administrativo`
            };

            transporter.sendMail(mailOptions, err => {
              if (err) console.log(err);
              res.redirect("/labaguasyalimentos/users/pending/approve");
            });
          } else {
            req.flash(
              "pendingUsers",
              `No existe el usuario con el correo ${email}`
            );
            res.redirect("/labaguasyalimentos/users/pending/approve");
          }
        }
      );
    } else {
      User.findOneAndRemove({ email: email }, (err, user) => {
        if (err) {
          console.log("Error: ", err);
          req.flash(
            "indexMessage",
            "Hubo problemas rechazando la cuenta del usuario"
          );
          res.redirect("/labaguasyalimentos");
        } else if (user) {
          const mailOptions = {
            from: "Administración",
            to: user.email,
            subject: "Estado de aprobación de cuenta",
            html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},</p>
              <br>Se le informa que su cuenta ha sido rechazada.<br><br><br>
              Att,<br><br>Equipo Administrativo`
          };

          transporter.sendMail(mailOptions, err => {
            if (err) console.log(err);
            res.redirect("/labaguasyalimentos/users/pending/approve");
          });
        } else {
          req.flash(
            "pendingUsers",
            `No existe el usuario con el correo ${email}`
          );
          res.redirect("/labaguasyalimentos/users/accountApproval");
        }
      });
    }
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
  }
};

// PUT /users/deactivateAccount -- Users deactivate account
exports.deactivateAccount = (req, res) => {
  if (req.user.state.includes("1")) {
    const { email } = req.body;
    if (req.body.account === "accept") {
      User.findOneAndUpdate(
        {
          email: email
        },
        { state: "3" },
        { new: true },
        (err, user) => {
          if (err) {
            console.log("Error: ", err);
            req.flash(
              "indexMessage",
              "Hubo problemas desactivando la cuenta del usuario"
            );
            res.redirect("/labaguasyalimentos");
          } else if (user) {
            const mailOptions = {
              from: "Administración",
              to: user.email,
              subject: "Desactivación de cuenta",
              html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},</p>
              <br>Se le informa que su cuenta ha sido desactivada.
              <br><br><br>Att,<br><br>Equipo Administrativo`
            };

            transporter.sendMail(mailOptions, err => {
              if (err) console.log(err);
              res.redirect("/labaguasyalimentos/users/pending/deactivate");
            });
          } else {
            req.flash(
              "pendingDeactivateUsers",
              `No existe el usuario con el correo ${email}`
            );
            res.redirect("/labaguasyalimentos/users/pending/deactivate");
          }
        }
      );
    } else {
      User.findOneAndUpdate(
        {
          email: email
        },
        { state: "2" },
        { new: true },
        (err, user) => {
          if (err) {
            console.log("Error: ", err);
            req.flash(
              "indexMessage",
              "Hubo problemas con la cuenta del usuario"
            );
            res.redirect("/labaguasyalimentos");
          } else if (user) {
            const mailOptions = {
              from: "Administración",
              to: user.email,
              subject: "Desactivación de cuenta",
              html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},</p>
                <br>Se le informa que su cuenta no ha sido desactivada.
                <br><br><br>Att,<br><br>Equipo Administrativo`
            };

            transporter.sendMail(mailOptions, err => {
              if (err) console.log(err);
              res.redirect("/labaguasyalimentos/users/pending/deactivate");
            });
          } else {
            req.flash(
              "pendingDeactivateUsers",
              `No existe el usuario con el correo ${email}`
            );
            res.redirect("/labaguasyalimentos/users/pending/deactivate");
          }
        }
      );
    }
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
  }
};

exports.menu = (req, res) => {
  if (req.user.state.includes("1")) {
    res.render("users/menu");
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
  }
};
