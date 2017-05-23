const mongoose = require("mongoose");
const timestamp = require("mongoose-timestamp");
const autoIncrement = require("mongoose-auto-increment");
const { Schema } = mongoose;
autoIncrement.initialize(mongoose.connection);

/*
  Solicitante
  - Nombres
  - Apellidos
  - Cédula
  - Cargo
  - Teléfono
  - Correo
*/
const ApplicantSchema = new Schema({
  uid: {
    type: String,
    require: true,
    unique: true,
    index: true
  },
  firstname: {
    type: String,
    require: true
  },
  lastname: {
    type: String,
    require: true
  },
  document: {
    type: String,
    require: true
  },
  position: {
    type: String,
    require: true
  },
  phone: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true,
    validate(email) {
      return /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        email
      );
    }
  }
});

/*
  Muestra
  - Tipo
  - Parámetro
  - Método
  - Precio muestra
  - Número de muestras
  - Valor total de muestras
*/
const SampleSchema = new Schema({
  type: {
    type: String,
    require: true
  },
  parameter: {
    type: String,
    require: true
  },
  method: {
    type: String,
    require: true
  },
  price: {
    type: Number,
    require: true
  },
  amount: {
    type: Number,
    require: true
  },
  totalPrice: {
    type: Number,
    require: true
  }
});

/*
  Cotización
  - Razón Social
  - Nit o C.C.
  - Dirección
  - Teléfono
  - Email
  * Solicitante
  * Muestra
*/
const QuotationSchema = new Schema({
  uid: {
    type: String,
    require: true,
    unique: true,
    index: true
  },
  createdBy: {
    type: String,
    require: true
  },
  businessName: {
    type: String,
    require: true
  },
  document: {
    type: String,
    require: true
  },
  address: {
    type: String,
    require: true
  },
  phone: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true,
    validate(email) {
      return /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        email
      );
    }
  },
  applicant: {
    type: ApplicantSchema,
    require: true
  },
  sample: {
    type: SampleSchema,
    require: true
  },
  total: {
    type: Number,
    require: true
  },
  state: {
    type: String,
    enum: ["0", "1", "2"],
    default: "0"
    // 0: pending, 1: ok, 2: removal request
  }
});

QuotationSchema.plugin(timestamp);
QuotationSchema.plugin(autoIncrement.plugin, "Quotation");
module.exports = mongoose.model("Quotation", QuotationSchema);
