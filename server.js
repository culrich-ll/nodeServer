var cluster = require('cluster');

if (cluster.isMaster)
{
  console.log('Server is active. Forking workers now.');
  var cpuCount = require('os').cpus().length;
  for (var i=0; i<cpuCount; i++)
  {
    cluster.fork();
  }
  cluster.on('exit', function(worker)
  {
    console.error('Worker %s has died! Creating a new one.', worker.id);
    cluster.fork();
  });
}
else {
  var restify = require('restify');

  var port = process.env.PORT || 8090;

  // State
  var next_user_id = 0;
  var users = {};

  // Server
  var server = restify.createServer({
    name: 'nodeRestify',
    version: '1.0.0'
  });
  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  server.get("/", function (req, res, next) {
    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(users));
    console.log('Worker: '+ cluster.worker.id);
    return next();
  });

  server.get('/user/:id', function (req, res, next) {
    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(users[parseInt(req.params.id)]));
    console.log('Worker: '+ cluster.worker.id);
    return next();
  });

  server.post('/user', function (req, res, next) {
    var user = req.params;
    user.id = next_user_id++;
    users[user.id] = user;
    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(user));
    console.log('Worker: '+ cluster.worker.id);
    return next();
  });

  server.put('/user/:id', function (req, res, next) {
    var user = users[parseInt(req.params.id)];
    var changes = req.params;
    delete changes.id;
    for(var x in changes) {
      user[x] = changes[x];
    }
    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(user));
    console.log('Worker: '+ cluster.worker.id);
    return next();
  });

  server.del('/user/:id', function (req, res, next) {
    delete users[parseInt(req.params.id)];
    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(true));
    console.log('Worker: '+ cluster.worker.id);
    return next();
  });

  server.listen(port, function () {
    console.log('Worker %s spawned for port %s.', cluster.worker.id, port);
  });

}

/*
// Client
// You'll see the client-side's output on the console when you run it.

var client = restify.createJsonClient({
  url: 'http://localhost:80',
  version: '~1.0'
});

client.post('/user', { name: "John Doe" }, function (err, req, res, obj) {
  if(err) console.log("An error ocurred:", err);
  else console.log('POST    /user   returned: %j', obj);

  client.get('/user/0', function (err, req, res, obj) {
    if(err) console.log("An error ocurred:", err);
    else console.log('GET     /user/0 returned: %j', obj);

    client.put('/user/0', { country: "USA" }, function (err, req, res, obj) {
      if(err) console.log("An error ocurred:", err);
      else console.log('PUT     /user/0 returned: %j', obj);

      client.del('/user/0', function (err, req, res, obj) {
        if(err) console.log("An error ocurred:", err);
        else console.log('DELETE  /user/0 returned: %j', obj);

        client.get('/', function (err, req, res, obj) {
          if(err) console.log("An error ocurred:", err);
          else console.log('GET     /       returned: %j', obj);
        });
      });
    });
  });
});
*/