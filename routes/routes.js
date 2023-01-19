const { gette } = require("../controllers/docs");

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
  }