var http = require('http');
const fs = require('fs');

var portInterServer1 = 8080;
var portInterServer2 = 8081;

var portClient1 = 8000;
var portClient2 = 8001;

var host1 = 'localhost';
var host2 = 'localhost';

var tableau = [];
var content = {};
var messages = {};
var id = 1;

fs.readFile('nouveauFichier.json', 'utf8', function (err, data) {
  content = data;
  if (content) {
    messages = JSON.parse(content);
  }
});

const databaseNameTable = (elTable, elId) => {
  var result = [];
  if (typeof elId == 'undefined') {
    messages[elTable].forEach((element) => {
      result.push(element);
    });
    return result;
  } else {
    return messages[elTable].filter((x) => x.id === parseInt(elId));
  }
};

var clientRequestHandler = function (req, res) {
  var path = req.url.split('?')[0];
  if (!path || path == '/') {
    console.log('erreur 404');
    res.writeHead(404, { 'Content-type': 'application/json' });
    res.end('{message : "page not found"}');
  } else {
    if (req.method == 'GET') {
      res.writeHead(200, { 'Content-type': 'application/json' });
      var pathTable = '/' + req.url.split('/')[1];
      var pathId = req.url.split('/')[2];
      if (!messages[pathTable]) {
        res.writeHead(500, { 'Content-type': 'application/json' });
        res.end('{message : "table not exists"}');
      } else if (pathTable && pathId) {
        console.log('DANS LE BON');
        const result = databaseNameTable(pathTable, pathId);
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.end(`${JSON.stringify(pathTable)} : ${JSON.stringify(result)}`);
      } else if (pathTable && !pathId) {
        if (messages[pathTable]) {
          var result = databaseNameTable(pathTable);
          res.writeHead(200, { 'Content-type': 'application/json' });
          res.end(`${JSON.stringify(pathTable)} : ${JSON.stringify(result)}`);
        }
      } else {
        res.writeHead(404, { 'Content-type': 'application/json' });
        res.end('{message : "page not found"}');
      }
    } else if (req.method == 'DELETE') {
    } else if (req.method == 'POST') {
      var body = '';
      req.on('data', function (data) {
        body += data.toString();
      });

      req.on('end', function () {
        var options = {
          port: portInterServer1,
          hostname: host2,
          host: host2 + ':' + portInterServer1,
          path: path,
          method: req.method,
        };
        // if (path.slice(0, 1) == '/') {
        //   console.log(path);
        //   const path2 = path.slice(1, path.length);
        //   console.log(path);
        // }
        var request = http.request(options, function (response) {
          var body = content;
          response.on('error', function (e) {
            console.log(e);
            res.writeHead(500, { 'Content-type': 'application/json' });
            res.end(e);
          });
          response.on('data', function (data) {
            body += data.toString();

            fs.writeFileSync('nouveauFichier.json', JSON.stringify(messages));
          });
          response.on('end', function () {
            res.writeHead(200, { 'Content-type': 'application/json' });
            res.end(body);
          });
        });
        request.on('error', function (e) {
          console.log(e);
          res.writeHead(500, { 'Content-type': 'application/json' });
          res.end(e);
        });
        request.end(body);
      });
    } else {
      console.log('error 404');
      res.writeHead(404, { 'Content-type': 'application/json' });
      res.end('{message : "page not found"}');
    }
  }
};
var interServerRequestHandler = function (req, res) {
  var path = req.url.split('?')[0];
  if (!path || path == '/') {
    res.writeHead(404, { 'Content-type': 'application/json' });
    res.end('{message : "page not found"}');
  } else {
    if (req.method == 'POST') {
      var body = '';
      res.writeHead(200, { 'Content-type': 'application/json' });
      req.on('data', function (data) {
        body += data.toString();
        console.log(typeof body);
        //if (id === à l'id des données de la table) foreach avant et incrémenter si égale en bouclant
        const source = { id: id };
        body = JSON.parse(body);
        body = Object.assign(body, source);
      }); //IL FAUT AJOUTER UN ID UNIQUE
      req.on('end', function () {
        if (!messages[path]) {
          messages[path] = [];
        }
        //tableau.push(JSON.parse(body));
        messages[path].push(body); //met en format json
        res.end(`{status : "ok"} ${messages}`);
      });
    } else {
      res.writeHead(404, { 'Content-type': 'application/json' });
      res.end('{message : "page not found"}');
    }
  }
};

var clientServer = http.createServer(clientRequestHandler);
var interServer = http.createServer(interServerRequestHandler);
clientServer.listen(portClient1);
interServer.listen(portInterServer1);
