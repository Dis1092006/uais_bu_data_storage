var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ message: 'You are running dangerously low on beer!' });
});

module.exports = router;
