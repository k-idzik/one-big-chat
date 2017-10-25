// Built on the structure of HTTP-Assignment-II by Cody Van De Mark

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
    if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html') {
      htmlHandler.getIndex(request, response);
    } else if (parsedUrl.pathname === '/style.css') {
      htmlHandler.getCSS(request, response);
    } else if (parsedUrl.pathname === '/getMessages') {
      jsonHandler.getMessages(request, response);
    } else if (parsedUrl.pathname === '/notReal') {
      jsonHandler.getNotReal(request, response);
    } else if (query.parse(parsedUrl.query).command !== undefined) {
      jsonHandler.getInfo(request, response, query.parse(parsedUrl.query));
    } else {
      jsonHandler.getNotReal(request, response);
    }
  } else if (parsedUrl.pathname === '/notReal' && request.method === 'HEAD') {
    jsonHandler.getNotRealHead(request, response);
  } else if (parsedUrl.pathname === '/postMessage' && request.method === 'POST') {
    // Also pass in the parsed URL for queries
    jsonHandler.postMessage(request, response, query.parse(parsedUrl.query));
  } else {
    jsonHandler.getNotReal(request, response);
  }
};

http.createServer(onRequest).listen(port);
