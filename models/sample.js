const mongoose = require("mongoose");
const timestamp = require("mongoose-timestamp");
const { Schema } = mongoose;

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
        price: 0
      }
    ]
  }
});

SampleSchema.plugin(timestamp);
module.exports = mongoose.model("Sample", SampleSchema);
