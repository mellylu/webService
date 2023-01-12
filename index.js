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
        pathIdExist = false;
        messages[pathTable].forEach((element) => {
          console.log(element.id);
          console.log(pathId);
          if (element.id === pathId) {
            pathIdExist = true;
          }
        });
        if (pathIdExist) {
          const result = databaseNameTable(pathTable, pathId);
          res.writeHead(200, { 'Content-type': 'application/json' });
          res.end(`${JSON.stringify(pathTable)} : ${JSON.stringify(result)}`);
        } else {
          res.writeHead(500, { 'Content-type': 'application/json' });
          res.end(`{message : ${pathId} is not exist}`);
        }
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
        pathIdExist = false;
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
      if (!messages[pathTable]) {
        res.writeHead(500, { 'Content-type': 'application/json' });
        res.end('{message : "table not exists"}');
      } else {
        if (pathTable && !pathId) {
          let body = '';
          req.on('data', function (data) {
            body += data.toString();
          });
          req.on('end', function () {
            body = JSON.parse(body);
            let cpt = 0;
            let nameTable = '';
            for (var nom_clee in body) {
              nameTable = nom_clee;
              cpt += 1;
              if (cpt === 1) {
                if (nameTable === 'name') {
                  body.name = `/${body.name}`;
                  messages[body.name] = [];
                  messages[pathTable].forEach((element) => {
                    messages[body.name].push(element);
                  });
                  delete messages[pathTable];
                  fs.writeFileSync(
                    'nouveauFichier.json',
                    JSON.stringify(messages),
                  );
                  res.writeHead(200, { 'Content-type': 'application/json' });
                  res.end(
                    `{message : ${body.name} : ${JSON.stringify(
                      messages[body.name],
                    )}}`,
                  ); //setinterval faire un fichier
                  //search à faire
                } else {
                  res.writeHead(500, { 'Content-type': 'application/json' });
                  res.end(
                    '{message : "il faut mettre : "name" : "....." pour changer le nom de la table}',
                  );
                }
              } else {
                res.writeHead(500, { 'Content-type': 'application/json' });
                res.end(
                  '{message : "il faut mettre : "name" : "....." pour changer le nom de la table}',
                );
              }
            }
          });
        } else if (pathTable && pathId) {
          messages[pathTable].forEach((element) => {
            if (element.id === pathId) {
              pathIdExist = true;
            }
          });
          if (pathIdExist) {
            console.log('DANS le ID');
            let body = '';
            let elementMessage;
            let n;
            let j = false;
            let b;
            let c;
            req.on('data', function (data) {
              body += data.toString();
              body = JSON.parse(body);
            });
            req.on('end', function () {
              //mise à jour si existe pas alors ça l'ajoute dans la table sinon ça remplace

              const result = databaseNameTable(pathTable, pathId);
              console.log('result');
              result.forEach((element) => {
                elementMessage = element;
              });

              for (var nom_clee in body) {
                for (var i in elementMessage) {
                  console.log('-----------');
                  if (i !== 'id') {
                    if (nom_clee === i) {
                      elementMessage[i] = body[i];
                      messages[pathTable] = messages[pathTable].filter(
                        (x) => x.id !== pathId,
                      );
                      messages[pathTable].push(elementMessage);
                    } else {
                      console.log(nom_clee);
                      console.log('dans le else');
                      c = {
                        [nom_clee]: body[nom_clee],
                      };
                      elementMessage = Object.assign(c, elementMessage);

                      messages[pathTable] = messages[pathTable].filter(
                        (x) => x.id !== pathId,
                      );
                      messages[pathTable].push(elementMessage);
                    }
                  }
                }
              }
              fs.writeFileSync('nouveauFichier.json', JSON.stringify(messages));
              res.writeHead(200, {
                'Content-type': 'application/json',
              });
              res.end(`{message : update ok}`);
            });
          } else {
            res.writeHead(500, { 'Content-type': 'application/json' });
            res.end(`{message : id : ${pathId} is not exist}`);
          }
        }
      }
      // const result = databaseNameTable(pathTable, pathId);
    } else if (req.method == 'POST') {
      if (!pathId) {
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
              console.log(body);
              fs.writeFileSync('nouveauFichier.json', JSON.stringify(messages));
            });
            response.on('end', function () {
              res.writeHead(200, { 'Content-type': 'application/json' });
              console.log(messages[pathTable]);
              res.end(`${pathTable} : ${JSON.stringify(messages[pathTable])}`);
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
        res.end('{message : "path not correct"}');
      }
    } else {
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
      req.on('data', function (data) {
        console.log(data);
        body += data.toString();
        // console.log(typeof body);
        let source = { id: crypto.randomBytes(16).toString('hex') };
        body = JSON.parse(body);
        body = Object.assign(body, source);
      });
      req.on('end', function () {
        if (!messages[path]) {
          messages[path] = [];
        }
        messages[path].push(body); //met en format json
        res.end(`${JSON.stringify(messages[path])}`);
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
