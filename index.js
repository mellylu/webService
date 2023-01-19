const http = require('http');
const fs = require('fs');
const crypto = require('crypto');

var portInterServer1 = 8080;
var portInterServer2 = 8081;

var portClient1 = 8000;
var portClient2 = 8001;

var host1 = 'localhost';
var host2 = 'localhost';

var content = {};
var messages = {};
let pathIdExist = false;

fs.readFile('nouveauFichier.json', 'utf8', function (err, data) {
  content = data;
  if (content) {
    messages = JSON.parse(content);
  }
});

const databaseNameTable = (elTable, elId) => {
  let result = [];
  if (typeof elId == 'undefined') {
    messages[elTable].forEach((element) => {
      result.push(element);
    });
    return result;
  } else {
    return messages[elTable].filter((x) => x.id === elId);
  }
};

const clientRequestHandler = function (req, res) {
  let path = req.url.split('?')[0];
  let pathTable = '/' + req.url.split('/')[1];
  let pathId = req.url.split('/')[2];

  if (!path || path == '/') {
    console.log('erreur 404');
    res.writeHead(404, { 'Content-type': 'application/json' });
    res.end('{message : "page not found"}');
  } else {
    if (req.method == 'GET') {
      res.writeHead(200, { 'Content-type': 'application/json' });
      if (!messages[pathTable]) {
        res.writeHead(500, { 'Content-type': 'application/json' });
        res.end('{message : "table not exists"}');
      } else if (pathTable && pathId) {
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
      if (!messages[pathTable]) {
        res.writeHead(500, { 'Content-type': 'application/json' });
        res.end('{message : "table not exists"}');
      } else if (pathTable && !pathId) {
        delete messages[pathTable];
        fs.writeFileSync('nouveauFichier.json', JSON.stringify(messages));
        res.end(`{message : "table ${pathTable} is delete"}`);
        //splice sert à remplacer, ajouter et supprimer
        //months.splice(1, 0, 'Feb'); replacer le deuxième élément par Feb
        //months.splice(2, 1); supprimer le troisième élément
      } else if (pathTable && pathId) {
        messages[pathTable].forEach((element) => {
          if (element.id === pathId) {
            pathIdExist = true;
          }
        });
        if (pathIdExist) {
          messages[pathTable] = messages[pathTable].filter(
            (x) => x.id !== pathId,
          );
          if (messages[pathTable].length === 0) {
            delete messages[pathTable];
            fs.writeFileSync('nouveauFichier.json', JSON.stringify(messages));
            res.end(`{message : "table ${pathTable} is delete"}`);
          } else {
            messages[pathTable] = messages[pathTable].filter(
              (x) => x.id !== pathId,
            );
            fs.writeFileSync('nouveauFichier.json', JSON.stringify(messages));
            res.end(`{message : "element ${pathTable} ${pathId} is delete"}`);
          }
        } else {
          res.writeHead(500, { 'Content-type': 'application/json' });
          res.end('{message : "id not exist"}');
        }
      }
    } else if (req.method == 'PUT') {
      console.log('DANS LE PUT');
      let body = '';
      req.on('data', function (data) {
        body += data.toString();
        console.log(req)
        for (i in body) {
          console.log(i);
        }
      });
      const result = databaseNameTable(pathTable, pathId);
    } else if (req.method == 'POST') {
      let body = '';
      req.on('data', function (data) {
        body += data.toString();
      });
      req.on('end', function () {
        let options = {
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
        let request = http.request(options, function (response) {
          let body = content;
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

const interServerRequestHandler = function (req, res) {
  let path = req.url.split('?')[0];
  if (!path || path == '/') {
    res.writeHead(404, { 'Content-type': 'application/json' });
    res.end('{message : "page not found"}');
  } else {
    if (req.method == 'POST') {
      let body = '';
      res.writeHead(200, { 'Content-type': 'application/json' });
      console.log(req)
      req.on('data', function (data) {
        body += data.toString();
        console.log(typeof body);
        let source = { id: crypto.randomBytes(16).toString('hex') };
        body = JSON.parse(body);
        body = Object.assign(body, source);
      });
      req.on('end', function () {
        if (!messages[path]) {
          messages[path] = [];
        }
        messages[path].push(body); //met en format json
        res.end(`{status : "ok"} ${messages}`);
      });
    } else {
      res.writeHead(404, { 'Content-type': 'application/json' });
      res.end('{message : "page not found"}');
    }
  }
};

let clientServer = http.createServer(clientRequestHandler);
let interServer = http.createServer(interServerRequestHandler);
clientServer.listen(portClient1);
interServer.listen(portInterServer1);
