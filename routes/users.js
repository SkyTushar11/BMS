var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/users');
var Account = require('../models/accounts');
var Branch = require('../models/branches');
var passport = require('passport');
var authenticate = require('../authenticate');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */

router.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.emailAddress}), req.body.password, 
  (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      // var age = Math.floor( yearsFromNow( req.body.dob ) );
      // if (age < 18) {
      //   err = new Error("You are not eligible to create an account");
      //   err.status = 403;
      //   return next(err);
      // }
      user.firstname = req.body.firstname;
      user.lastname = req.body.lastname;
      user.aadharNo = req.body.aadharNo;
      user.emailAddress = req.body.emailAddress;
      user.contact = req.body.contact;
      user.address = req.body.address;
      user.dob = req.body.dob;
      user.accounts = [];
      user.age = 18;
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
        }
        passport.authenticate('local')(req, res, () => {
          var accNo = Math.floor((Math.random() * 9999999999) + 999999999);
          Account.create({accountNo: accNo, accountName: user.firstname+user.lastname, accountHolder: req.user._id})
          .then((account) => {
            user.account = account._id;
            user.save((err, user) => {
              if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
              }
            });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success:true, status: "Registration Successful"});
          }, (err) => next(err))
          .catch((err) => {next(err)});
      });
      });
    }
  });
});


router.post('/login', passport.authenticate('local'),
(req, res) => {
  var token = authenticate.getToken({_id: req.user._id})
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

router.get('/logout', (req, res, next) => {
  res.redirect('/');
});


module.exports = router;
