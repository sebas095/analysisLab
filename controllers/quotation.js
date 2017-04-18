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
        'Hubo problemas en el registro, intenta de nuevo'
      );
      return res.redirect('/');
    }
    res.redirect('/');
  });
};
