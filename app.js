'use strict';

var express = require('express'),
  app = express(),
  watson = require('watson-developer-cloud'),
  extend = require('util')._extend,
  i18n = require('i18next'),
  Twit = require('twit');

//i18n settings
require('./config/i18n')(app);

// Bootstrap application settings
require('./config/express')(app);

// Create the service wrapper
var personalityInsights = watson.personality_insights({
  version: 'v2',
  username: '', // Insert your Watson credentials here
  password: ''
});

var T = new Twit({
  consumer_key: '', // Insert your Twitter key here
  consumer_secret: '',
  app_only_auth: true
})

app.get('/', function(req, res) {
  res.render('index', {
    ct: req._csrfToken
  });
});

app.post('/api/profile', function(req, res, next) {

  var userName = req.body.text

  T.get('statuses/user_timeline', {
    screen_name: userName,
    count: 200
  }, function(err, data, response) {
    if (err)
      console.log('error:', err);

    var buffer = "";
    for (var i = 0; i < data.length; i++) {
      buffer = buffer.concat(data[i].text);
    }

    personalityInsights.profile({
        text: buffer,
        language: 'en'
      },
      function(err, profile) {
        if (err)
          console.log('error:', err);
        else {

          return res.json(profile);
        }
      });

  });

});

// error-handler settings
require('./config/error-handler')(app);

var port = process.env.PORT || 3000;
app.listen(port);
console.log('listening at:', port);
