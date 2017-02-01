module.exports = function(server){
  var api = require('./api');
  server.get("/", api.getalluser);
  server.get('/user/:id', api.getuser);
  server.post('/user', api.createuser);
  server.put('/user/:id', api.changeuser);
  server.del('/user/:id', api.deletuser);
}