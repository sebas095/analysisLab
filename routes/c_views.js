const express = require('express');
const router = express.Router();

module.exports = (app, mountPoint) => {
  router.get('/', (req, res) => {
    res.render('c_views/new-c')
  });

  router.get('/register', (req, res) => {
    res.render('c_views/register-c')
  });
  router.get('/cotizacion', (req, res) => {
    res.render('c_views/cotizacion-c')
  });
  router.get('/search', (req, res) => {
    res.render('c_views/search-c')
  });

  app.use(mountPoint, router);
};
