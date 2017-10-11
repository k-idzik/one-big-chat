const http = require('http');
const url = require('url'); // URL parsing
const query = require('querystring'); // Parsing queries from the URL
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url); // Parse the URL

  // GET, HEAD, and POST requests
  if (request.method === 'GET') {
    switch (parsedUrl.pathname) {
      case '/' || '/index.html':
        htmlHandler.getIndex(request, response);
        break;
      case '/style.css':
        htmlHandler.getCSS(request, response);
        break;
      case '/getUsers':
        jsonHandler.getUsers(request, response);
        break;
      case '/notReal':
        jsonHandler.getNotReal(request, response);
        break;
      default:
        jsonHandler.getNotReal(request, response);
        break;
    }
  } else if (parsedUrl.pathname === '/getUsers' && request.method === 'HEAD') {
    jsonHandler.getUsersHead(request, response);
  } else if (parsedUrl.pathname === '/notReal' && request.method === 'HEAD') {
    jsonHandler.getNotRealHead(request, response);
  } else if (parsedUrl.pathname === '/addUser' && request.method === 'POST') {
    // Also pass in the parsed URL for queries
    jsonHandler.getAddUser(request, response, query.parse(parsedUrl.query));
  } else {
    jsonHandler.getNotReal(request, response);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
