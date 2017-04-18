const Quotation = require('../models/quotation');

// GET /quotation/new -- Quotation form
exports.new = (req, res) => {
  res.render('quotation/new');
};

// POST /quotation/create -- Create a new quotation
exports.create = (req, res) => {
  const applicant = {
    firstname: req.body['applicant.firstname'],
    lastname: req.body['applicant.lastname'],
    document: req.body['applicant.document'],
    position: req.body['applicant.position'],
    phone: req.body['applicant.phone'],
    email: req.body['applicant.email'],
  };

  const sample = {
    type: req.body['sample.type'],
    parameter: req.body['sample.parameter'],
    method: req.body['sample.method'],
    price: req.body['sample.price'],
    amount: req.body['sample.amount'],
    totalPrice: req.body['sample.totalPrice'],
  };

  const quotation = {
    businessName: req.body['businessName'],
    document: req.body['document'],
    address: req.body['address'],
    phone: req.body['phone'],
    email: req.body['email'],
    applicant: applicant,
    sample: sample,
    total: req.body['total'],
  };

  Quotation.create(quotation, (err, data) => {
    if (err) {
      console.log(err);
      req.flash(
        'indexMessage',
        'Hubo problemas creando la cotización, intenta de nuevo'
      );
      return res.redirect('/');
    }
    res.redirect('/');
  });
};

// GET /quotation/pending/approval -- Quotations pending for approve
exports.pending = (req, res) => {
  Quotation.find({state: '0'}, (err, data) => {
    if (err) {
      console.log('Error: ', err);
      req.flash(
        'indexMessage',
        'Hubo problemas obteniendo los datos de las cotizaciones, ' +
        'intenta de nuevo'
      );
      res.redirect('/');
    } else if (data.length > 0) {
      res.render('quotation/pending', {
        quotations: data,
        user: req.user,
        message: req.flash('pendingQuotations'),
      });
    } else {
      req.flash(
        'indexMessage',
        'No hay cotizaciones disponibles para aprobar/rechazar'
      );
      res.redirect('/');
    }
  });
};

// PUT /quotation/approval/:id -- Quotations approval
exports.approval = (req, res) => {
  const {id} = req.params;

  if (req.body.veredict === 'accept') {
    Quotation.findByIdAndUpdate(id, {state: '1'}, {new: true}, (err, data) => {
      if (err) {
        console.log('Error: ', err);
        req.flash(
          'indexMessage',
          'Hubo problemas aprobando la cotización'
        );
        res.redirect('/');
      } else if (data) {
        res.redirect('/quotation/pending/approval');
      } else {
        req.flash(
          'pendingQuotations',
          'No existe la cotización'
        );
        res.redirect('/quotation/pending/approval');
      }
    });
  } else {
    Quotation.findByIdAndRemove(id, (err, data) => {
      if (err) {
        console.log('Error: ', err);
        req.flash(
          'indexMessage',
          'Hubo problemas rechazando la cotización'
        );
        res.redirect('/');
      } else if (data) {
        res.redirect('/quotation/pending/approval');
      } else {
        req.flash(
          'pendingQuotations',
          'No existe la cotización'
        );
        res.redirect('/quotation/pending/approval');
      }
    });
  }
};

// GET /quotation/:id -- Return a specific quotation
exports.getQuotation = (req, res) => {
  const {id} = req.params;

  Quotation.findById(id, (err, data) => {
    if (err) {
      console.log('Error: ', err);
      req.flash(
        'indexMessage',
        'Hubo problemas obteniendo los datos de la cotización, ' +
        'intenta de nuevo'
      );
      res.redirect('/');
    } else if (data) {
      res.render('quotation/edit', {
        quotation: data,
        message: req.flash('quotationMessage'),
      });
    } else {
      req.flash('indexMessage', 'La cotización no se encuentra disponible');
      res.redirect('/');
    }
  });
};

// PUT /quotation/:id -- Modifies a specific quotation
exports.edit = (req, res) => {
  const {id} = req.params;

};

// PUT /quotation/:id/deactivate -- Request for deactivate a specific quotation
exports.changeState = (req, res) => {
  const {id} = req.params;
  Quotation.findByIdAndUpdate(id, {state: '2'}, {new: true}, (err, data) => {
    if (err) {
      console.log(err);
      req.flash(
        'indexMessage',
        'Hubo problemas en la solicitud de eliminación de la cotización'
      );
      return res.redirect('/');
    }
    req.flash(
      'quotationMessage',
      'Pronto el administrador revisara tu solicitud ' +
      `y se te notificara al correo electrónico`
    );
    res.redirect(`/quotation/${id}`);
  });
};

// GET /quotation/pending/deactivate -- Quotations pending for deactivate
exports.pendingDeactivate = (req, res) => {
  Quotation.find({state: '2'}, (err, data) => {
    if (err) {
      console.log('Error: ', err);
      req.flash(
        'indexMessage',
        'Hubo problemas obteniendo los datos de las cotizaciones, ' +
        'intenta de nuevo'
      );
      res.redirect('/');
    } else if (data.length > 0) {
      res.render('quotation/deactivate', {
        quotations: data,
        user: req.user,
        message: req.flash('deactivateQuotations'),
      });
    } else {
      req.flash(
        'indexMessage',
        'No hay hay solicitudes para aprobar/rechazar'
      );
      res.redirect('/');
    }
  });
};

// PUT /quotation/deactivate/:id-- Quotations deactivate
exports.deactivate = (req, res) => {
  const {id} = req.params;

  if (req.body.veredict === 'accept') {
    Quotation.findByIdAndUpdate(id, {state: '3'}, {new: true}, (err, data) => {
      if (err) {
        console.log('Error: ', err);
        req.flash(
          'indexMessage',
          'Hubo problemas eliminando la cotización'
        );
        res.redirect('/');
      } else if (data) {
        res.redirect('/quotation/pending/deactivate');
      } else {
        req.flash(
          'deactivateQuotations',
          'No existe la cotización'
        );
        res.redirect('/quotation/pending/deactivate');
      }
    });
  } else {
    Quotation.findByIdAndUpdate(id, {state: '1'}, (err, data) => {
      if (err) {
        console.log('Error: ', err);
        req.flash(
          'indexMessage',
          'Hubo problemas rechazando la solicitud'
        );
        res.redirect('/');
      } else if (data) {
        res.redirect('/quotation/pending/deactivate');
      } else {
        req.flash(
          'pendingQuotations',
          'No existe la cotización'
        );
        res.redirect('/quotation/pending/deactivate');
      }
    });
  }
};
