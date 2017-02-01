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

  // Server
  var server = restify.createServer({
    name: 'nodeRestify',
    version: '1.0.0'
  });

  var routes = require('./routes/routes')(server);

  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  server.listen(port, function () {
    console.log('Worker %s spawned for port %s.', cluster.worker.id, port);
  });

}