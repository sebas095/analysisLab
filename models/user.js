const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const bcrypt = require('bcrypt');
const {Schema} = mongoose;
const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema({
  firstname: {
    type: String,
    require: true,
  },
  lastname: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
    validate(email) {
      return /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
    },
  },
  rol: {
    type: String,
    require: true,
  },
  state: {
    type: String,
    enum: ['0', '1', '2', '3', '4'],
    default: '0',
    // 0: pending, 1: admin, 2: user ok, 3: user disabled, 4: removal request
  },
  password: {
    type: String,
    require: true,
  },
});

// Encrypt the password
UserSchema.pre('save', function(next) {
  let user = this;
  if (user.isModified('password') || user.isNew) {
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

UserSchema.plugin(timestamp);
module.exports = mongoose.model('User', UserSchema);
