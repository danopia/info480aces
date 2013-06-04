var terms = ['MyGirlFriendNotAllowedTo', 'MyBoyFriendNotAllowedTo', 'IndirectYourEx'];
//var terms = ['mlb', 'phillies', 'marlins'];

var https = require('https'),
    fs = require('fs');

var auth = require('fs').readFileSync('auth.conf', 'utf8').trim();
var server = 'stream.twitter.com';
var path = 'statuses/filter.json?track=' + terms.join(',');
var url = 'https://' + auth + '@' + server + '/1.1/' + path;

exports.terms = terms;
exports.targets = [];
exports.dropped = 0;

function onLine (raw) {
  if (!raw.length) {
    console.log('Given empty line');
    return;
  };
  
  var tweet = JSON.parse(raw);
  if (tweet.limit) {
    var justnow = exports.dropped - tweet.limit.track;
    exports.dropped = tweet.limit.track;
    console.log('Dropped', justnow, 'tweets');
    
    var data = {justNow: justnow, total: exports.dropped};
    exports.targets.forEach(function (target) {
      target.emit('dropped', data);
    });
    
  } else if (tweet.text) {
    if (!tweet.retweeted_status) {
      //console.log('Given non-RT status from', '@' + tweet.user.screen_name);
      return;
    };
    
    console.log('@' + tweet.user.screen_name, tweet.text);
    
    exports.targets.forEach(function (target) {
      target.emit('tweet', tweet);
    });
  
  } else {
    console.log('Given non-tweet:', tweet);
  };
};

https.get(url, function(res) {
  if (res.statusCode != 200) {
    console.log("statusCode: ", res.statusCode);
    return;
  };

  var buffer = '';
  res.on('data', function(d) {
    buffer += d.toString();
    var i;
    
    while ((i = buffer.indexOf('\r\n')) >= 0) {
      var line = buffer.substr(0, i);
      onLine(line);
      buffer = buffer.substr(i+2);
    };
  });

}).on('error', function(e) {
  console.error(e);
});

