// var http = require('http');

// var messages = {};

// var requestHandler = function(req, res){
//     var path = req.url.split('?')[0];
//     if(!path || path =='/'){
//         res.writeHead(404, {'Content-type': 'application/json'});
//         res.end('{message : "page not found"}');
//     }else{
//         if(req.method == 'GET'){
//             res.writeHead(200, {'Content-type': 'application/json'});
//             if(!messages[path]){
//                 res.end(JSON.stringify([]));
//             }else{
//                 res.end(JSON.stringify(messages[path]));
//                 messages[path] = 0;
//                 delete messages[path];
//             }    
//         }else if(req.method == 'POST'){
//             var body = '';
//             res.writeHead(200, {'Content-type': 'application/json'});
//             req.on('data', function(data){
//                 body += data.toString();
//             });
//             req.on('end', function(){
//                 if(!messages[path]){
//                     messages[path] = [];
//                 }
//                 messages[path].push(body);
//                 res.end('{status : "ok"}');
//             });  
//         }else{
//             res.writeHead(404, {'Content-type': 'application/json'});
//             res.end('{message : "page not found"}');
//         }
//     }
// }

// var serveur = http.createServer(requestHandler);
// serveur.listen(7000);