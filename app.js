const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const cors = require("cors");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const favicon = require("serve-favicon");
const logger = require("morgan");
const methodOverride = require("method-override");
const path = require("path");
const expSession = require("express-session");
const MongoStore = require("connect-mongo")(expSession);
const User = require("./models/user");

require("colors");
require("./config/passport")(passport);

const env = process.env.NODE_ENV || "dev";
const config = require("./config/" + env);

const index = require("./routes/index");
const users = require("./routes/users");
const session = require("./routes/session");
const account = require("./routes/account");
const quotation = require("./routes/quotation");
const samples = require("./routes/samples");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// middlewares
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(partials());
app.use("/labaguasyalimentos", express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(
  expSession({
    secret: config.secret,
    resave: true,
    saveUninitialized: true,
    // using store session on MongoDB using express-session + connect
    store: new MongoStore({
      url: config.db.url,
      collection: "sessions"
    })
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

global.HOST = config.url;
// mongo config
mongoose.Promise = global.Promise;
mongoose.connect(config.db.url);
app.db = mongoose.connection;
app.on("open", () => {
  console.log("connected to db".yellow);
});

// Helpers dinamicos:
app.use((req, res, next) => {
  if (req.session.passport) {
    const id = req.session.passport.user;
    User.findById(id, (err, user) => {
      if (err) console.log(err);
      res.locals.session = {
        firstname: user.firstname,
        lastname: user.lastname,
        rol: user.rol,
        state: user.state
      };
      next();
    });
  } else
    next();
});

// routes
index(app, "/labaguasyalimentos");
users(app, "/labaguasyalimentos/users");
account(app, "/labaguasyalimentos/account");
quotation(app, "/labaguasyalimentos/quotation");
session(app, "/labaguasyalimentos/session", passport);
samples(app, "/labaguasyalimentos/samples");

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = env === "dev" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
