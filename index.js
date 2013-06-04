var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    stream = require('./stream'),
    https = require('https'),
    fs = require('fs');

io.set('log level', 1);
app.listen(8000);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

var embeds = {};

io.sockets.on('connection', function (socket) {
  stream.targets.push(socket);
  
  socket.emit('terms', stream.terms);
  
  socket.on('embed', function (id) {
    if (embeds[id]) {
      socket.emit('embed', embeds[id]);
    } else {
      var url = 'https://api.twitter.com/1/statuses/oembed.json?id=' + id + '&align=center';
      https.get(url, function(res) {
        console.log("statusCode: ", res.statusCode);

        var buffer = '';
        res.on('data', function(d) {
          buffer += d.toString();
        });
        res.on('end', function () {
          var embed = JSON.parse(buffer);
          embed.id = id;
          console.log(embed);
          socket.emit('embed', embed);
          embeds[id] = embed;
        });

      }).on('error', function(e) {
        console.error(e);
          socket.emit('embed', {id: id});
      });
    };
  });
});

