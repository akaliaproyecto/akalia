const express = require('express');
const router = express.Router();

router.get('/admin/dashboard', (req, res) => {
  res.render('pages/admin-dashboard', {
    title: 'Panel Administrador - Akalia'
  });
});

module.exports = router;