// Node's built-in cryptography module.
const crypto = require('crypto');

// Users object, stored in memory
const users = {};

// SHA-1 is a bit of a quicker hash algorithm for insecure things
let etag = crypto.createHash('sha1').update(JSON.stringify(users));
// Get the hash as a hex string
let digest = etag.digest('hex');

// Responding to GET
const respondJSON = (request, response, status, object) => {
  // Response header
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  response.writeHead(status, headers); // Write the header
  response.write(JSON.stringify(object)); // Write the data
  response.end();
};

// Responding to HEAD
const respondJSONHead = (request, response, status) => {
  // Response header
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  // Can't write data in a head request
  response.writeHead(status, headers);
  response.end();
};

// // getUsers GET
// const getUsers = (request, response) => {
//  const JSONResponse = {
//    users,
//  };
//
//  // Client etag, checks if anything has changed
//  if (request.headers['if-none-match'] === digest) {
//    return respondJSONHead(request, response, 304); // 304, already have file
//  }
//
//  return respondJSON(request, response, 200, JSONResponse); // 200
// };
//
// // getUsers HEAD
// const getUsersHead = (request, response) => {
//  // Client etag, checks if anything has changed
//  if (request.headers['if-none-match'] === digest) {
//    return respondJSONHead(request, response, 304); // 304, already have file
//  }
//
//  return respondJSONHead(request, response, 200); // 200
// };

// notReal GET
const getNotReal = (request, response) => {
  const JSONResponse = {
    id: 'notFound',
    message: 'Message: The page you are looking for was not found.',
  };

  return respondJSON(request, response, 404, JSONResponse); // 404
};

// notReal HEAD
const getNotRealHead = (request, response) => {
  // 404
  respondJSONHead(request, response, 404);
};

// postMessage POST
const getMessage = (request, response, params) => {
  const JSONResponse = {
    username: params.name,
    message: params.message,
  };

  // Invalid parameters
  if (!params.name) {
    JSONResponse.id = 'badRequest';
    JSONResponse.message = 'You must have a Username!';
    return respondJSON(request, response, 400, JSONResponse);
  } else if (!params.message) {
    JSONResponse.id = 'badRequest';
    JSONResponse.message = 'You need to have a message to post!';
    return respondJSON(request, response, 400, JSONResponse);
  }

  // // User already exists
  // if (users[params.name]) {
  //  return respondJSONHead(request, response, 204); // 204
  // }

  if (!users[params.name]) {
    users[params.name] = params.name; // Add the user, indexes by the user's name
  }

  etag = crypto.createHash('sha1').update(JSON.stringify(users)); // Create a new hash object
  digest = etag.digest('hex'); // Recalculate the hash digest for the etag

  return respondJSON(request, response, 201, JSONResponse); // 201
};

module.exports = {
  // getUsers,
  // getUsersHead,
  getNotReal,
  getNotRealHead,
  getMessage,
};
