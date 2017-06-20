const Quotation = require("../models/quotation");
const User = require("../models/user");
const path = require("path");
const fs = require("fs");
const JSZip = require("jszip");
const Docxtemplater = require("docxtemplater");
const uuid = require("uuid");
const { auth } = require("../config/email");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport(
  `smtps://${auth.user}:${auth.pass}@smtp.gmail.com`
);

/*
  Responsable Tecnico --  Crear, revisa
  Auxiliar Administrativo -- Crea
  Director del Laboratorio -- crear, Revisa
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
        res.redirect("/labaguasyalimentos");
      } else if (data.length > 0) {
        res.render("quotation/new", { id: data[data.length - 1]._id + 1 });
      } else {
        res.render("quotation/new", { id: 1 });
      }
    });
  } else
    res.redirect("/labaguasyalimentos");
};

// POST /quotation/create -- Create a new quotation
exports.create = (req, res) => {
  if (isAuthorized(req.user.rol)) {
    const quotation = {
      uid: uuid.v4(),
      createdBy: req.user._id,
      method: req.body.method,
      date: JSON.parse(req.body.date),
      businessName: req.body.businessName,
      document: req.body.document,
      applicant: req.body.applicant,
      position: req.body.position,
      address: req.body.address,
      phone: req.body.phone,
      city: req.body.city,
      email: req.body.email,
      samples: JSON.parse(req.body.samples),
      observations: req.body.observations,
      total: Number(req.body.total)
    };

    Quotation.create(quotation, (err, data) => {
      if (err) {
        console.log(err);
        req.flash(
          "indexMessage",
          "Hubo problemas creando la cotización, intenta de nuevo"
        );
        return res.redirect("/labaguasyalimentos");
      }
      User.find(
        {
          $or: [
            { rol: "responsable técnico", state: "1" },
            { rol: "responsable técnico", state: "2" },
            { rol: "responsable técnico", state: "4" },
            { rol: "director del laboratorio", state: "1" },
            { rol: "director del laboratorio", state: "2" },
            { rol: "director del laboratorio", state: "4" },
            { rol: "auxiliar administrativo", state: "1" },
            { rol: "auxiliar administrativo", state: "2" },
            { rol: "auxiliar administrativo", state: "4" }
          ]
        },
        (err, users) => {
          if (err) {
            console.log(err);
            req.flash(
              "indexMessage",
              "Hubo problemas para notificar por correo"
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
              subject: "Aprobación de cotizaciones",
              html: `<p>Estimado Usuario,</p><br>Se le informa que
              hay cotizaciones pendientes para aprobar o rechazar, para
              ingresar ve a la siguiente dirección:
              <br><a href="${HOST}/quotation/pending/approval">
              Iniciar sesión</a><br><br><br>Att,<br><br>
              Equipo Administrativo`
            };

            transporter.sendMail(mailOptions, err => {
              if (err) console.log(err);
              req.flash(
                "quotationMessage",
                "La cotización ha sido creada exitosamente"
              );
              res.redirect(`/labaguasyalimentos/quotation/${data._id}`);
            });
          } else {
            req.flash("indexMessage", "Hubo problemas en el servidor");
            res.redirect("/labaguasyalimentos");
          }
        }
      );
    });
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
  }
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
        res.redirect("/labaguasyalimentos");
      } else if (data.length > 0) {
        res.render("quotation/pending", {
          quotations: data,
          user: req.user,
          message: req.flash("pendingQuotations")
        });
      } else {
        req.flash(
          "indexMessage",
          "No hay más cotizaciones disponibles para aprobar/rechazar"
        );
        res.redirect("/labaguasyalimentos");
      }
    });
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
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
            res.redirect("/labaguasyalimentos");
          } else if (data) {
            User.findById(data.createdBy, (err, user) => {
              if (err) {
                req.flash(
                  "indexMessage",
                  "Hubo problemas aprobando la cotización"
                );
                res.redirect("/labaguasyalimentos");
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
                  res.redirect(
                    "/labaguasyalimentos/quotation/pending/approval"
                  );
                });
              } else {
                req.flash(
                  "pendingQuotations",
                  "No usuario no se encuentra registrado"
                );
                res.redirect("/labaguasyalimentos/quotation/pending/approval");
              }
            });
          } else {
            req.flash("pendingQuotations", "No existe la cotización");
            res.redirect("/labaguasyalimentos/quotation/pending/approval");
          }
        }
      );
    } else {
      Quotation.findByIdAndRemove(id, (err, data) => {
        if (err) {
          console.log("Error: ", err);
          req.flash("indexMessage", "Hubo problemas rechazando la cotización");
          res.redirect("/labaguasyalimentos");
        } else if (data) {
          User.findById(data.createdBy, (err, user) => {
            if (err) {
              req.flash(
                "indexMessage",
                "Hubo problemas aprobando la cotización"
              );
              res.redirect("/labaguasyalimentos");
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
                res.redirect("/labaguasyalimentos/quotation/pending/approval");
              });
            } else {
              req.flash(
                "pendingQuotations",
                "No usuario no se encuentra registrado"
              );
              res.redirect("/labaguasyalimentos/quotation/pending/approval");
            }
          });
        } else {
          req.flash("pendingQuotations", "No existe la cotización");
          res.redirect("/labaguasyalimentos/quotation/pending/approval");
        }
      });
    }
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
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
        res.redirect("/labaguasyalimentos");
      } else if (data) {
        res.render("quotation/edit", {
          quotation: data,
          message: req.flash("quotationMessage")
        });
      } else {
        req.flash("indexMessage", "La cotización no se encuentra disponible");
        res.redirect("/labaguasyalimentos");
      }
    });
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
  }
};

// PUT /quotation/:id -- Modifies a specific quotation
exports.edit = (req, res) => {
  const { id } = req.params;

  if (isAuthorized(req.user.rol)) {
    const quotation = {
      method: req.body.method,
      date: JSON.parse(req.body.date),
      businessName: req.body.businessName,
      document: req.body.document,
      applicant: req.body.applicant,
      position: req.body.position,
      address: req.body.address,
      phone: req.body.phone,
      city: req.body.city,
      email: req.body.email,
      samples: JSON.parse(req.body.samples),
      observations: req.body.observations,
      total: Number(req.body.total)
    };

    Quotation.findByIdAndUpdate(id, quotation, (err, data) => {
      if (err) {
        console.log("Error: ", err);
        req.flash(
          "indexMessage",
          "Hubo problemas actualizando los datos, intenta de nuevo"
        );
        return res.redirect("/labaguasyalimentos");
      }
      req.flash(
        "quotationMessage",
        "Sus datos han sido actualizados exitosamente"
      );
      res.redirect(`/labaguasyalimentos/quotation/${id}`);
    });
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
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
          return res.redirect("/labaguasyalimentos");
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
                subject: "Eliminación de cotizaciones",
                html: `<p>Estimado Usuario,</p><br>Se le informa que
                  hay solicitudes para la eliminación de cotizaciones, para
                  aprobar o rechazar, si deseas ingresar ve a la siguiente dirección:<br>
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
                res.redirect(`/labaguasyalimentos/quotation/${id}`);
              });
            } else {
              req.flash(
                "indexMessage",
                "No hay más usuarios disponibles para la revisión de la solicitud"
              );
              res.redirect("/labaguasyalimentos");
            }
          }
        );
      }
    );
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
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
        res.redirect("/labaguasyalimentos");
      } else if (data.length > 0) {
        res.render("quotation/deactivate", {
          quotations: data,
          user: req.user,
          message: req.flash("deactivateQuotations")
        });
      } else {
        req.flash(
          "indexMessage",
          "No hay hay más solicitudes para aprobar/rechazar"
        );
        res.redirect("/labaguasyalimentos");
      }
    });
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
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
          res.redirect("/labaguasyalimentos");
        } else if (data) {
          User.findById(data.createdBy, (err, user) => {
            if (err) {
              console.log("Error: ", err);
              req.flash(
                "indexMessage",
                "Hubo problemas notificando la aprobación " +
                  "de eliminación de cotización al usuario"
              );
              res.redirect("/labaguasyalimentos");
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
                res.redirect("/labaguasyalimentos/quotation/pending/delete");
              });
            } else {
              req.flash(
                "deactivateQuotations",
                "El usuario no se encuentra registrado"
              );
              res.redirect("/labaguasyalimentos/quotation/pending/delete");
            }
          });
        } else {
          req.flash("deactivateQuotations", "No existe la cotización");
          res.redirect("/labaguasyalimentos/quotation/pending/delete");
        }
      });
    } else {
      Quotation.findByIdAndUpdate(id, { state: "1" }, (err, data) => {
        if (err) {
          console.log("Error: ", err);
          req.flash("indexMessage", "Hubo problemas rechazando la solicitud");
          res.redirect("/labaguasyalimentos");
        } else if (data) {
          User.findById(data.createdBy, (err, user) => {
            if (err) {
              req.flash(
                "indexMessage",
                "Hubo problemas notificando el rechazo " +
                  "de eliminación de cotización al usuario"
              );
              res.redirect("/labaguasyalimentos");
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
                res.redirect("/labaguasyalimentos/quotation/pending/delete");
              });
            } else {
              req.flash(
                "deactivateQuotations",
                "El usuario no se encuentra registrado"
              );
              res.redirect("/labaguasyalimentos/quotation/pending/delete");
            }
          });
        } else {
          req.flash("pendingQuotations", "No existe la cotización");
          res.redirect("/labaguasyalimentos/quotation/pending/delete");
        }
      });
    }
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
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
    res.redirect("/labaguasyalimentos");
  }
};

// GET /quotation/:id/export -- Return a quotation in a docx document
exports.exportToWord = (req, res) => {
  if (isAuthorized(req.user.rol)) {
    // Load the docx file as a binary
    // fs.unlinkSync(
    //   path.resolve(__dirname + "/../public/docs", "cotizacion.docx")
    // );
    const content = fs.readFileSync(
      path.resolve(__dirname + "/../public/docs", "template.docx"),
      "binary"
    );

    const zip = new JSZip(content);
    const doc = new Docxtemplater();
    const { id } = req.params;
    doc.loadZip(zip);

    Quotation.findById(id, (err, quotation) => {
      if (err) {
        req.flash(
          "quotationMessage",
          "Hubo problemas exportando la cotización, intenta más tarde"
        );
        res.redirect(`/labaguasyalimentos/quotation/${id}`);
      } else if (quotation) {
        let { samples } = quotation;
        let dataSamples = [];
        samples.map(sample => {
          const { type } = sample;
          dataSamples.push(
            ...sample.parameters.map(param => {
              param.type = type;
              return param;
            })
          );
        });

        let method = { t: "", p: "", e: "", c: "" };
        method[quotation.method] = "X";
        // set the templateVariables
        doc.setData({
          t: method.t,
          p: method.p,
          e: method.e,
          c: method.c,
          number: quotation._id,
          day: quotation.date.day,
          month: quotation.date.month,
          year: quotation.date.year,
          businessName: quotation.businessName,
          document: quotation.document,
          applicant: quotation.applicant,
          position: quotation.position,
          address: quotation.address,
          phone: quotation.phone,
          city: quotation.city,
          email: quotation.email,
          samples: dataSamples,
          observations: quotation.observations,
          total: quotation.total
        });
        try {
          // render the document
          doc.render();
        } catch (error) {
          const e = {
            message: error.message,
            name: error.name,
            stack: error.stack,
            properties: error.properties
          };
          console.log(JSON.stringify({ error: e }));
          // The error thrown here contains additional information when logged
          //  with JSON.stringify (it contains a property object).
          throw error;
          req.flash(
            "quotationMessage",
            "Hubo problemas exportando la cotización, intenta más tarde"
          );
          return res.redirect(`/labaguasyalimentos/quotation/${id}`);
        }

        const buf = doc.getZip().generate({ type: "nodebuffer" });
        // buf is a nodejs buffer, you can either write it to a file
        // or do anything else with it.
        fs.writeFileSync(
          path.resolve(__dirname + "/../public/docs", "cotizacion.docx"),
          buf
        );
        res.redirect("/labaguasyalimentos/docs/cotizacion.docx");
      } else {
        req.flash(
          "indexMessage",
          "La cotización que solicitada no se encuentra registrada"
        );
        res.redirect("/labaguasyalimentos");
      }
    });
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
  }
};

exports.menu = (req, res) => {
  if (isAuthorized(req.user.rol)) {
    res.render("quotation/menu");
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
  }
};

// GET /quotation/pending/approval/:id -- approval a specific quotation
exports.showApproval = (req, res) => {
  if (isAuthorized(req.user.rol)) {
    const { id } = req.params;
    Quotation.findById(id, (err, quotation) => {
      if (err) {
        console.log(err);
        req.flash(
          "pendingQuotations",
          "Hubo problemas con la cotización solicitada, intenta más tarde"
        );
        return res.redirect("/labaguasyalimentos/quotation/pending/approval");
      } else if (quotation) {
        res.render("quotation/approval", { quotation });
      } else {
        req.flash(
          "pendingQuotations",
          "La cotización solicitada no se encuentra disponible"
        );
        res.redirect("/labaguasyalimentos/quotation/pending/approval");
      }
    });
  } else {
    req.flash("indexMessage", "No tienes permisos para acceder");
    res.redirect("/labaguasyalimentos");
  }
};
