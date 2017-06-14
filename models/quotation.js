const mongoose = require("mongoose");
const timestamp = require("mongoose-timestamp");
const autoIncrement = require("mongoose-auto-increment");
const { Schema } = mongoose;
autoIncrement.initialize(mongoose.connection);

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
  method: {
    type: String,
    require: true,
    default: ""
  },
  date: {
    type: Object,
    require: true,
    default: {
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    }
  },
  businessName: {
    type: String,
    require: true,
    default: ""
  },
  document: {
    type: String,
    require: true,
    default: ""
  },
  applicant: {
    type: String,
    require: true,
    default: ""
  },
  position: {
    type: String,
    require: true,
    default: ""
  },
  address: {
    type: String,
    require: true,
    default: ""
  },
  phone: {
    type: String,
    require: true,
    default: ""
  },
  city: {
    type: String,
    require: true,
    default: ""
  },
  email: {
    type: String,
    require: true,
    default: ""
  },
  samples: {
    type: Array,
    require: true,
    default: []
  },
  observations: {
    type: String,
    require: true,
    default: ""
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

/*
samples = [{
  type: "AGUA CRUDA",
  parameters: [
    {
      parameter:,
      method: ,
      price: ,
      amount: ,
      total:
    }
  ]
}]
 */

QuotationSchema.plugin(timestamp);
QuotationSchema.plugin(autoIncrement.plugin, {
  startAt: 1,
  model: "Quotation"
});
module.exports = mongoose.model("Quotation", QuotationSchema);
