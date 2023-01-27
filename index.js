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
let pathDataBase;
let nameBD;
let BD = [];
let messages2;
let notnull;

fs.readFile(`database/database.json`, 'utf8', function (err, data) {
  content = data;
  if (content) {
    messages = JSON.parse(content);
  }
});

const databaseNameTable = (elTable, elId) => {
  let result = [];
  if (typeof elId == 'undefined') {
    messages[elTable].forEach((element) => {
      console.log(element);
      // result.unshift(element.id);
      result.push(element);
    });
    return result;
  } else {
    return messages[elTable].filter((x) => x.id === elId);
  }
};

const clientRequestHandler = function (req, res) {
  const headersGetOnly = {
    'Access-Control-Allow-Origin': '*',

    'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT, DELETE',
  };
  if (req.method === 'OPTIONS') {
    res.writeHead(200, headersGetOnly);
    res.end('KKKKKKKKKKKK');
    return 0;
  }

  let path = req.url.split('?')[0];
  let pathSearch = req.url.split('?')[1];
  let pathTable = req.url.split('/')[1];
  let pathId = req.url.split('/')[2];
  let search = '';
  let sort;
  let tab = [];
  let pathSearchs;
  var onecaracspe = /[^A-Za-z0-9_]/;
  if (pathSearch) {
    pathSearchs = pathSearch.split('&');
  }
  console.log(req.method);
  if (!path || path == '/') {
    res.writeHead(404, headersGetOnly);
    res.end('{message : "page not found"}');
  } else {
    if (req.method === 'GET') {
      if (pathSearch) {
        sort = pathSearch.split('=')[0];
        if (sort === 'sort') {
          if (messages[pathTable]) {
            var result = databaseNameTable(pathTable);
            result.sort(function compare(a, b) {
              if (a[pathSearch.split('=')[1]] < b[pathSearch.split('=')[1]])
                return -1;
              if (a[pathSearch.split('=')[1]] > b[pathSearch.split('=')[1]])
                return 1;
              return 0;
            });
            res.writeHead(200, headersGetOnly);
            res.end(`${JSON.stringify(result)}`);
          }
        } else {
          let tabb = messages[pathTable];
          for (let j = 0; j < pathSearchs.length; j++) {
            tab = [];
            result = databaseNameTable(pathTable);
            search = pathSearchs[j].split('=')[0];
            tabb.forEach((element) => {
              for (let i in element) {
                if (search === i && search !== 'id') {
                  if (element[i].includes(pathSearchs[j].split('=')[1])) {
                    tab.push(element);
                  }
                }
              }
            });
            tabb = tab;
          }
          tabb = JSON.stringify(tabb);
          if (tabb !== '[]') {
            res.writeHead(200, headersGetOnly);
            res.end(`${tabb}`);
          } else {
            res.writeHead(404, headersGetOnly);
            res.end('{message : "search not found"}');
          }
        }
      } else {
        res.writeHead(200, { 'Content-type': 'application/json' });
        if (!messages[pathTable]) {
          res.writeHead(404, headersGetOnly);
          res.end('{message : "table not exists"}');
        } else if (pathTable && pathId) {
          pathIdExist = false;
          messages[pathTable].forEach((element) => {
            if (element.id === pathId) {
              pathIdExist = true;
            }
          });
          if (pathIdExist) {
            const result = databaseNameTable(pathTable, pathId);
            res.writeHead(200, headersGetOnly);
            res.end(`${JSON.stringify(result)}`);
          } else {
            res.writeHead(404, headersGetOnly);
            res.end(`{message : ${pathId} is not exist}`);
          }
        } else if (pathTable && !pathId) {
          if (messages[pathTable]) {
            var result = databaseNameTable(pathTable);
            res.writeHead(200, headersGetOnly);
            res.end(`${JSON.stringify(result)}`);
          }
        } else {
          res.writeHead(404, headersGetOnly);
          res.end('{message : "page not found"}');
        }
      }
    } else if (req.method === 'DELETE') {
      // res.writeHead(200, headersGetOnly);
      console.log(pathTable);
      console.log(messages[pathTable]);
      if (!messages[pathTable]) {
        console.log('passe dans le bon');
        res.writeHead(404, headersGetOnly);
        res.end('{message : "table not exists"}');
      } else if (pathTable && !pathId) {
        delete messages[pathTable];
        res.writeHead(200, headersGetOnly);
        res.end(`{message : "table ${pathTable} is delete"}`);
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
            res.writeHead(200, headersGetOnly);
            res.end(`{message : "table ${pathTable} is delete"}`);
          } else {
            messages[pathTable] = messages[pathTable].filter(
              (x) => x.id !== pathId,
            );
            res.writeHead(200, headersGetOnly);
            res.end(`{message : "element ${pathTable} ${pathId} is delete"}`);
          }
        } else {
          res.writeHead(404, headersGetOnly);
          res.end('{message : "id not exist"}');
        }
      }
    } else if (req.method == 'PUT') {
      if (!messages[pathTable]) {
        res.writeHead(404, headersGetOnly);
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
                  if (body.name) {
                    if (body.name.match(onecaracspe)) {
                      res.writeHead(404, headersGetOnly);
                      res.end(
                        '{message : "Les caractères spéciaux ne sont pas autorisés dans le nom des tables"}',
                      );
                    } else {
                      body.name = `${body.name}`;
                      messages[body.name] = [];
                      messages[pathTable].forEach((element) => {
                        messages[body.name].push(element);
                      });
                      delete messages[pathTable];

                      res.writeHead(200, headersGetOnly);
                      res.end(
                        `{${body.name} : ${JSON.stringify(
                          messages[body.name],
                        )}}`,
                      );
                    }
                  } else {
                    res.writeHead(404, headersGetOnly);
                    res.end(`{new name is not null}`);
                  }

                  //setinterval faire un fichier
                  //search à faire
                } else {
                  res.writeHead(404, headersGetOnly);
                  res.end(
                    `{message : "il faut mettre : "name" : "....." pour changer le nom de la table}`,
                  );
                }
              } else {
                res.writeHead(404, headersGetOnly);
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
            let c;
            req.on('data', function (data) {
              body += data.toString();
              body = JSON.parse(body);
            });
            req.on('end', function () {
              //mise à jour si existe pas alors ça l'ajoute dans la table sinon ça remplace

              const result = databaseNameTable(pathTable, pathId);
              result.forEach((element) => {
                elementMessage = element;
              });
              let key;
              let value;
              for (var nom_clee in body) {
                for (var i in elementMessage) {
                  if (i !== 'id') {
                    if (nom_clee === i) {
                      key = nom_clee;
                      value = body[nom_clee];
                      elementMessage[i] = body[i];
                      messages[pathTable] = messages[pathTable].filter(
                        (x) => x.id !== pathId,
                      );
                      messages[pathTable].push(elementMessage);
                    } else {
                      key = nom_clee;
                      value = body[nom_clee];
                      if (nom_clee !== '' && body[nom_clee] !== '') {
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
              }
              if (key && value) {
                console.log('dans uf');
                res.writeHead(200, headersGetOnly);
                res.end(`{message : update ok}`);
              } else {
                res.writeHead(404, headersGetOnly);
                res.end(`key and value are not null`);
              }
            });
          } else {
            res.writeHead(404, headersGetOnly);
            res.end(`{message : id : ${pathId} is not exist}`);
          }
        }
      }
    } else if (req.method == 'POST') {
      pathTable = '/' + req.url.split('/')[1];
      if (path.substr(1).match(onecaracspe)) {
        res.writeHead(404, headersGetOnly);
        res.end(
          '{message : "Les caractères spéciaux ne sont pas autorisés dans le nom des tables"}',
        );
      } else {
        console.log('dans le else');
        if (!pathId) {
          let body = '';
          req.on('data', function (data) {
            body += data.toString();
            console.log(body);
            console.log(typeof body);
          });
          req.on('end', function () {
            let options = {
              port: portInterServer1,
              hostname: host2,
              host: host2 + ':' + portInterServer1,
              path: pathTable,
              method: req.method,
            };
            let request = http.request(options, function (response) {
              let body = content;
              response.on('error', function (e) {
                res.writeHead(404, headersGetOnly);
                res.end(e);
              });
              response.on('data', function (data) {
                body += data.toString();
              });
              console.log('notnull');
              console.log(notnull);
              if (notnull) {
                response.on('end', function () {
                  res.writeHead(200, headersGetOnly);
                  res.end(`${pathTable} : ok}`);
                });
              } else {
                response.on('end', function () {
                  res.writeHead(404, headersGetOnly);
                  res.end(`key and value is not null`);
                });
              }
            });
            request.on('error', function (e) {
              console.log(e);
              res.writeHead(404, headersGetOnly);
              res.end(e);
            });
            request.end(body);
          });
        } else {
          res.writeHead(404, headersGetOnly);
          res.end('{message : "path not correct"}');
        }
      }
    } else {
      res.writeHead(404, headersGetOnly);
      res.end('{message : "page not found"}');
    }
  }
};

const interServerRequestHandler = function (req, res) {
  const headersGetOnly = {
    'Access-Control-Allow-Origin': '*',

    'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT, DELETE',
  };

  let pathTable = req.url.split('/')[1];
  console.log(pathTable);
  if (!pathTable || pathTable == '/') {
    res.writeHead(404, headersGetOnly);
    res.end('{message : "page not found"}');
  } else {
    if (req.method == 'POST') {
      let body = '';
      res.writeHead(200, headersGetOnly);
      req.on('data', function (data) {
        body += data.toString();
        let source = { id: crypto.randomBytes(16).toString('hex') };
        body = JSON.parse(body);
        let x1;
        let x2;
        Object.values(body).forEach((element) => (x1 = element));
        Object.keys(body).forEach((element) => (x2 = element));
        if (x1 !== '' && x2 !== '') {
          console.log('not null true');
          notnull = true;
        } else {
          console.log('not null false');
          notnull = false;
        }
        body = Object.assign(source, body);
      });

      req.on('end', function () {
        if (notnull) {
          if (!messages[pathTable]) {
            messages[pathTable] = [];
          }
          messages[pathTable].push(body); //met en format json
          res.writeHead(200, headersGetOnly);
          res.end(`${JSON.stringify(messages[pathTable])}`);
        } else {
          res.writeHead(404, headersGetOnly);
          res.end(`key and value are not null`);
        }
      });
    } else {
      res.writeHead(404, headersGetOnly);
      res.end('{message : "page not found"}');
    }
  }
};

setInterval(function () {
  fs.writeFileSync(`database/database.json`, JSON.stringify(messages));
}, 300000); //300000 s = 5 min

let clientServer = http.createServer(clientRequestHandler);
let interServer = http.createServer(interServerRequestHandler);

clientServer.listen(portClient1);
interServer.listen(portInterServer1);
