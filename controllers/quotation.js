const Quotation = require("../models/quotation");
const User = require("../models/user");
const HtmlDocx = require("html-docx-js");
const ejs = require("ejs");
const fs = require("fs");
const uuid = require("uuid");
const { auth } = require("../config/email");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport(
  `smtps://${auth.user}:${auth.pass}@smtp.gmail.com`
);

/*
  Responsable Tecnico --  Crear, revisa
  Auxiliar Administrativo -- Crea
  Director del Laboratorio -- crear, Revisa ==> falta añadir el director
*/

/**
* Check if the role of the user is authorized
* @param  {string} rol - User rol
* @return {boolean}
*/
function isAuthorized(rol) {
  const roles = [
    "director del laboratorio",
    "responsable técnico",
    "auxiliar administrativo"
  ];
  return roles.includes(rol);
}

/**
* Check if the role of the user is authorized to review a quotation
* @param  {string} rol - User rol
* @return {boolean}
*/
function isAuthorizedReview(rol) {
  const roles = ["responsable técnico", "director del laboratorio"];
  return roles.includes(rol);
}

// GET /quotation/new -- Quotation form
exports.new = (req, res) => {
  if (isAuthorized(req.user.rol)) {
    Quotation.find({}, (err, data) => {
      if (err) {
        console.log("Error: ", err);
        req.flash(
          "indexMessage",
          "Hubo problemas en el servidor, intenta de nuevo"
        );
        res.redirect("/");
      } else if (data.length > 0) {
        res.render("quotation/new", { id: data[data.length - 1]._id + 1 });
      } else {
        res.render("quotation/new", { id: 1 });
      }
    });
  } else
    res.redirect("/");
};

// POST /quotation/create -- Create a new quotation
exports.create = (req, res) => {
  if (isAuthorized(req.user.rol)) {
    const applicant = {
      uid: uuid.v4(),
      firstname: req.body["applicant.firstname"],
      lastname: req.body["applicant.lastname"],
      document: req.body["applicant.document"],
      position: req.body["applicant.position"],
      phone: req.body["applicant.phone"],
      email: req.body["applicant.email"]
    };

    const sample = {
      type: req.body["sample.type"],
      parameter: req.body["sample.parameter"],
      method: req.body["sample.method"],
      price: req.body["sample.price"],
      amount: req.body["sample.amount"],
      totalPrice: req.body["sample.totalPrice"]
    };

    const quotation = {
      uid: uuid.v4(),
      createdBy: req.user._id,
      businessName: req.body["businessName"],
      document: req.body["document"],
      address: req.body["address"],
      phone: req.body["phone"],
      email: req.body["email"],
      applicant: applicant,
      sample: sample,
      total: req.body["total"]
    };

    Quotation.create(quotation, (err, data) => {
      if (err) {
        console.log(err);
        req.flash(
          "indexMessage",
          "Hubo problemas creando la cotización, intenta de nuevo"
        );
        return res.redirect("/");
      }
      User.find(
        {
          $or: [
            { rol: "responsable técnico", state: "1" },
            { rol: "responsable técnico", state: "2" },
            { rol: "responsable técnico", state: "4" },
            { rol: "director del laboratorio", state: "1" },
            { rol: "director del laboratorio", state: "2" },
            { rol: "director del laboratorio", state: "4" }
          ]
        },
        (err, users) => {
          if (err) {
            console.log(err);
            req.flash(
              "indexMessage",
              "Hubo problemas para notificar por correo"
            );
            return res.redirect("/");
          } else if (users.length > 0) {
            let emails = "";
            for (let i = 0; i < users.length; i++) {
              if (i > 0) emails += ",";
              emails += users[i].email;
            }

            const mailOptions = {
              from: "Administración",
              to: emails,
              subject: "Aprobación de cotizaciones",
              html: `<p>Estimado Usuario,</p><br>Se le informa que
              hay cotizaciones pendientes para su aprobación, si deseas
              ingresar ve a la siguiente dirección:
              <br><a href="${HOST}/quotation/pending/approval">
              Iniciar sesión</a><br><br><br>Att,<br><br>
              Equipo Administrativo`
            };

            transporter.sendMail(mailOptions, err => {
              if (err) console.log(err);
              res.redirect("/");
            });
          } else {
            req.flash("indexMessage", "Hubo problemas en el servidor");
            res.redirect("/");
          }
        }
      );
    });
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/");
  }
};

// POST /quotation/samples/create -- Create a sample
exports.createSample = (req, res) => {
  // TODO
};

// GET /quotation/pending/approval -- Quotations pending for approve
exports.pending = (req, res) => {
  if (isAuthorizedReview(req.user.rol)) {
    Quotation.find({ state: "0" }, (err, data) => {
      if (err) {
        console.log("Error: ", err);
        req.flash(
          "indexMessage",
          "Hubo problemas obteniendo los datos de las cotizaciones, " +
            "intenta de nuevo"
        );
        res.redirect("/");
      } else if (data.length > 0) {
        res.render("quotation/pending", {
          quotations: data,
          user: req.user,
          message: req.flash("pendingQuotations")
        });
      } else {
        req.flash(
          "indexMessage",
          "No hay cotizaciones disponibles para aprobar/rechazar"
        );
        res.redirect("/");
      }
    });
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/");
  }
};

// PUT /quotation/approval/:id -- Quotations approval
exports.approval = (req, res) => {
  const { id } = req.params;

  if (isAuthorizedReview(req.user.rol)) {
    if (req.body.veredict === "accept") {
      Quotation.findByIdAndUpdate(
        id,
        { state: "1" },
        {
          new: true
        },
        (err, data) => {
          if (err) {
            console.log("Error: ", err);
            req.flash("indexMessage", "Hubo problemas aprobando la cotización");
            res.redirect("/");
          } else if (data) {
            User.findById(data.createdBy, (err, user) => {
              if (err) {
                req.flash(
                  "indexMessage",
                  "Hubo problemas aprobando la cotización"
                );
                res.redirect("/");
              } else if (user) {
                const mailOptions = {
                  from: "Administración",
                  to: user.email,
                  subject: "Estado de aprobación de la cotización",
                  html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},
                    </p><br>Se le informa que su cotización ha sido aprobada,
                    si deseas ingresar ve a la siguiente dirección:<br>
                    <a href="${HOST}/quotation/${data._id}">Iniciar sesión
                    </a><br><br><br>Att,<br><br>Equipo Administrativo`
                };

                transporter.sendMail(mailOptions, err => {
                  if (err) console.log(err);
                  res.redirect("/quotation/pending/approval");
                });
              } else {
                req.flash(
                  "pendingQuotations",
                  "No usuario no se encuentra registrado"
                );
                res.redirect("/quotation/pending/approval");
              }
            });
          } else {
            req.flash("pendingQuotations", "No existe la cotización");
            res.redirect("/quotation/pending/approval");
          }
        }
      );
    } else {
      Quotation.findByIdAndRemove(id, (err, data) => {
        if (err) {
          console.log("Error: ", err);
          req.flash("indexMessage", "Hubo problemas rechazando la cotización");
          res.redirect("/");
        } else if (data) {
          User.findById(data.createdBy, (err, user) => {
            if (err) {
              req.flash(
                "indexMessage",
                "Hubo problemas aprobando la cotización"
              );
              res.redirect("/");
            } else if (user) {
              const mailOptions = {
                from: "Administración",
                to: user.email,
                subject: "Estado de aprobación de la cotización",
                html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},
                  </p><br>Se le informa que su cotización ha sido rechazada,
                  la justificación es la siguiente:<br><br>
                  ${req.body.justification}<br><br><br>Att,<br><br>
                  Equipo Administrativo`
              };

              transporter.sendMail(mailOptions, err => {
                if (err) console.log(err);
                res.redirect("/quotation/pending/approval");
              });
            } else {
              req.flash(
                "pendingQuotations",
                "No usuario no se encuentra registrado"
              );
              res.redirect("/quotation/pending/approval");
            }
          });
        } else {
          req.flash("pendingQuotations", "No existe la cotización");
          res.redirect("/quotation/pending/approval");
        }
      });
    }
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/");
  }
};

// GET /quotation/:id -- Return a specific quotation
exports.getQuotation = (req, res) => {
  const { id } = req.params;
  if (isAuthorized(req.user.rol)) {
    Quotation.findById(id, (err, data) => {
      if (err) {
        console.log("Error: ", err);
        req.flash(
          "indexMessage",
          "Hubo problemas obteniendo los datos de la cotización, " +
            "intenta de nuevo"
        );
        res.redirect("/");
      } else if (data) {
        res.render("quotation/edit", {
          quotation: data,
          message: req.flash("quotationMessage")
        });
      } else {
        req.flash("indexMessage", "La cotización no se encuentra disponible");
        res.redirect("/");
      }
    });
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/");
  }
};

// PUT /quotation/:id -- Modifies a specific quotation
exports.edit = (req, res) => {
  const { id } = req.params;

  if (isAuthorized(req.user.rol)) {
    const applicant = {
      firstname: req.body["applicant.firstname"],
      lastname: req.body["applicant.lastname"],
      document: req.body["applicant.document"],
      position: req.body["applicant.position"],
      phone: req.body["applicant.phone"],
      email: req.body["applicant.email"]
    };

    const sample = {
      type: req.body["sample.type"],
      parameter: req.body["sample.parameter"],
      method: req.body["sample.method"],
      price: req.body["sample.price"],
      amount: req.body["sample.amount"],
      totalPrice: req.body["sample.totalPrice"]
    };

    const quotation = {
      businessName: req.body["businessName"],
      document: req.body["document"],
      address: req.body["address"],
      phone: req.body["phone"],
      email: req.body["email"],
      applicant: applicant,
      sample: sample,
      total: req.body["total"]
    };

    Quotation.findByIdAndUpdate(id, quotation, (err, data) => {
      if (err) {
        console.log("Error: ", err);
        req.flash(
          "indexMessage",
          "Hubo problemas actualizando los datos, intenta de nuevo"
        );
        return res.redirect("/");
      }
      req.flash(
        "quotationMessage",
        "Sus datos han sido actualizados exitosamente"
      );
      res.redirect(`/quotation/${id}`);
    });
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/");
  }
};

// PUT /quotation/:id/delete -- Request for delete a specific quotation
exports.changeState = (req, res) => {
  const { id } = req.params;
  if (isAuthorized(req.user.rol)) {
    Quotation.findByIdAndUpdate(
      id,
      { state: "2" },
      { new: true },
      (err, data) => {
        if (err) {
          console.log(err);
          req.flash(
            "indexMessage",
            "Hubo problemas en la solicitud de eliminación de la cotización"
          );
          return res.redirect("/");
        }
        User.find(
          {
            $or: [
              { rol: "responsable técnico", state: "1" },
              { rol: "responsable técnico", state: "2" },
              { rol: "responsable técnico", state: "4" },
              { rol: "director del laboratorio", state: "1" },
              { rol: "director del laboratorio", state: "2" },
              { rol: "director del laboratorio", state: "4" }
            ]
          },
          (err, users) => {
            if (err) {
              console.log(err);
              req.flash(
                "indexMessage",
                "Hubo problemas para notificar la revisión de la solicitud"
              );
              return res.redirect("/");
            } else if (users.length > 0) {
              let emails = "";
              for (let i = 0; i < users.length; i++) {
                if (i > 0) emails += ",";
                emails += users[i].email;
              }

              const mailOptions = {
                from: "Administración",
                to: emails,
                subject: "Eliminación de cotizaciones",
                html: `<p>Estimado Usuario,</p><br>Se le informa que
              hay solicitudes para la eliminación de cotizaciones, para su
              aprobación, si deseas ingresar ve a la siguiente dirección:<br>
              <a href="${HOST}/quotation/pending/delete">Iniciar sesión</a>
              <br><br><br>Att,<br><br>Equipo Administrativo`
              };

              transporter.sendMail(mailOptions, err => {
                if (err) console.log(err);
                req.flash(
                  "quotationMessage",
                  "Pronto el administrador revisara tu solicitud " +
                    `y se te notificara al correo electrónico ${req.user.email}`
                );
                res.redirect(`/quotation/${id}`);
              });
            } else {
              req.flash(
                "indexMessage",
                "No hay usuarios disponibles para la revisión de la solicitud"
              );
              res.redirect("/");
            }
          }
        );
      }
    );
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/");
  }
};

// GET /quotation/pending/delete -- Quotations pending for delete
exports.pendingDelete = (req, res) => {
  if (isAuthorizedReview(req.user.rol)) {
    Quotation.find({ state: "2" }, (err, data) => {
      if (err) {
        console.log("Error: ", err);
        req.flash(
          "indexMessage",
          "Hubo problemas obteniendo los datos de las cotizaciones, " +
            "intenta de nuevo"
        );
        res.redirect("/");
      } else if (data.length > 0) {
        res.render("quotation/deactivate", {
          quotations: data,
          user: req.user,
          message: req.flash("deactivateQuotations")
        });
      } else {
        req.flash(
          "indexMessage",
          "No hay hay solicitudes para aprobar/rechazar"
        );
        res.redirect("/");
      }
    });
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/");
  }
};

// PUT /quotation/delete/:id-- Quotations delete
exports.delete = (req, res) => {
  const { id } = req.params;
  if (isAuthorizedReview(req.user.rol)) {
    if (req.body.veredict === "accept") {
      Quotation.findByIdAndRemove(id, (err, data) => {
        if (err) {
          console.log("Error: ", err);
          req.flash("indexMessage", "Hubo problemas eliminando la cotización");
          res.redirect("/");
        } else if (data) {
          User.findById(data.createdBy, (err, user) => {
            if (err) {
              console.log("Error: ", err);
              req.flash(
                "indexMessage",
                "Hubo problemas notificando la aprobación " +
                  "de eliminación de cotización al usuario"
              );
              res.redirect("/");
            } else if (user) {
              const mailOptions = {
                from: "Administración",
                to: user.email,
                subject: "Eliminación de cotización",
                html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},
                  </p><br>Se le informa que solicitud de eliminación de la
                  cotización ha sido aprobada exitosamente.
                  <br><br><br>Att,<br><br>Equipo Administrativo`
              };

              transporter.sendMail(mailOptions, err => {
                if (err) console.log(err);
                res.redirect("/quotation/pending/delete");
              });
            } else {
              req.flash(
                "deactivateQuotations",
                "El usuario no se encuentra registrado"
              );
              res.redirect("/quotation/pending/delete");
            }
          });
        } else {
          req.flash("deactivateQuotations", "No existe la cotización");
          res.redirect("/quotation/pending/delete");
        }
      });
    } else {
      Quotation.findByIdAndUpdate(id, { state: "1" }, (err, data) => {
        if (err) {
          console.log("Error: ", err);
          req.flash("indexMessage", "Hubo problemas rechazando la solicitud");
          res.redirect("/");
        } else if (data) {
          User.findById(data.createdBy, (err, user) => {
            if (err) {
              req.flash(
                "indexMessage",
                "Hubo problemas notificando el rechazo " +
                  "de eliminación de cotización al usuario"
              );
              res.redirect("/");
            } else if (user) {
              const mailOptions = {
                from: "Administración",
                to: user.email,
                subject: "Eliminación de cotización",
                html: `<p>Estimado Usuario ${user.firstname} ${user.lastname},
                  </p><br>Se le informa que su solicitud de eliminación de la
                  cotización ha sido rechazada.<br><br><br>Att,
                  <br><br>Equipo Administrativo`
              };

              transporter.sendMail(mailOptions, err => {
                if (err) console.log(err);
                res.redirect("/quotation/pending/delete");
              });
            } else {
              req.flash(
                "deactivateQuotations",
                "El usuario no se encuentra registrado"
              );
              res.redirect("/quotation/pending/delete");
            }
          });
        } else {
          req.flash("pendingQuotations", "No existe la cotización");
          res.redirect("/quotation/pending/delete");
        }
      });
    }
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/");
  }
};

// GET /quotation/search -- Form to search a specific quotation
exports.search = (req, res) => {
  if (isAuthorized(req.user.rol))
    if (req.query.id) {
      Quotation.find(
        {
          $or: [
            { _id: Number(req.query.id), state: "1" },
            { document: req.query.id, state: "1" }
          ]
        },
        null,
        { sort: { createdAt: -1 } },
        (err, data) => {
          if (err) {
            console.log("Error: ", err);
            res.render("quotation/search", {
              message: "Hubo problemas buscando la cotización, " +
                "intenta de nuevo",
              quotations: [],
              results: []
            });
          } else if (data.length > 0) {
            res.render("quotation/search", {
              message: "",
              quotations: data,
              results: []
            });
          } else {
            res.render("quotation/search", {
              message: "No hay resultados encontrados",
              quotations: [],
              results: []
            });
          }
        }
      );
    } else {
      Quotation.find(
        { state: "1" },
        null,
        { sort: { createdAt: -1 } },
        (err, data) => {
          if (err) {
            console.log("Error: ", err);
            res.render("quotation/search", {
              message: "Hubo en el servidor, intenta de nuevo",
              quotations: [],
              results: []
            });
          } else if (data.length > 0) {
            res.render("quotation/search", {
              message: "",
              quotations: [],
              results: data.slice(0, 10)
            });
          } else {
            res.render("quotation/search", {
              message: "No hay cotizaciones disponibles",
              quotations: [],
              results: []
            });
          }
        }
      );
    }
  else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/");
  }
};

exports.exportToWord = (req, res) => {
  // res.render("quotation/word");
  ejs.renderFile("views/quotation/word.ejs", (err, html) => {
    const options = {
      orientation: "landscape",
      margins: {
        top: "3cm",
        right: "2.09cm",
        bottom: "2.5cm",
        left: "1.75cm"
      }
    };
    const docx = HtmlDocx.asBlob(html, options);
    fs.writeFile(`${__dirname}/../public/docs/cotizacion.docx`, docx, err => {
      if (err) console.log(err);
      res.redirect("/docs/cotizacion.docx");
    });
  });
};

exports.menu = (req, res) => {
  if (isAuthorized(req.user.rol)) {
    res.render("quotation/menu");
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/");
  }
};

exports.approval = (req, res) => {
  if (isAuthorized(req.user.rol)) {
    res.render("quotation/approval");
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/");
  }
};
