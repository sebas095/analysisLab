const mongoose = require("mongoose");
const timestamp = require("mongoose-timestamp");
const autoIncrement = require("mongoose-auto-increment");
const { Schema } = mongoose;
autoIncrement.initialize(mongoose.connection);

const SampleSchema = new Schema({
  type: {
    type: String,
    require: true
  },
  parameters: {
    type: Array,
    require: true,
    default: [
      {
        parameter: "",
        method: "",
        price: 0.0
      }
    ]
  }
});

SampleSchema.plugin(timestamp);
SampleSchema.plugin(autoIncrement.plugin, "Sample");
module.exports = mongoose.model("Sample", SampleSchema);
