// Node's built-in cryptography module.
const crypto = require('crypto');

// Users object, stored in memory
// Also contains the user's messages
const messages = {};
const users = {};
let messageIndexer = 0; // Indexer for the messages object
let usersIndexer = 0; // Indexer for the users object

// SHA-1 is a bit of a quicker hash algorithm for insecure things
let etag = crypto.createHash('sha1').update(JSON.stringify(messages));
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

// getMessages GET
const getMessages = (request, response) => {
  const JSONResponse = {
    messages,
    messageIndexer,
  };

  // Client etag, checks if anything has changed
  if (request.headers['if-none-match'] === digest) {
    return respondJSONHead(request, response, 304); // 304, already have file
  }

  return respondJSON(request, response, 200, JSONResponse); // 200
};
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
    message: 'The page you are looking for was not found.',
  };

  return respondJSON(request, response, 404, JSONResponse); // 404
};

// notReal HEAD
const getNotRealHead = (request, response) => {
  // 404
  respondJSONHead(request, response, 404);
};

// postMessage POST
const postMessage = (request, response, params) => {
  const JSONResponse = {
    username: params.name,
    message: params.message,
    cookie: params.cookie,
  };

  // Invalid parameters
  if (!params.name) {
    JSONResponse.message = 'You must have a Username!';
    return respondJSON(request, response, 400, JSONResponse);
  } else if (!params.message) {
    JSONResponse.message = 'You need to have a message to post!';
    return respondJSON(request, response, 400, JSONResponse);
  }

  // Check if the username is taken
  for (let i = 0; i < usersIndexer; i++) {
    if (users[i].name.toString() === params.name.toString()
        && params.cookie === '') {
      JSONResponse.message = 'This username is already taken. Please choose another username.';
      return respondJSON(request, response, 400, JSONResponse);
    }
  }

  if (params.cookie === '') {
    // New user
    JSONResponse.cookie = usersIndexer;

    // Store this user's cookie
    users[usersIndexer] = {
      name: params.name,
      cookie: usersIndexer,
    };
    usersIndexer++; // Increment the indexer
  } else {
    // Check all users to see if they have this name
    for (let i = 0; i < usersIndexer; i++) {
      if (users[i].name.toString() === params.name.toString()
          && users[i].cookie.toString() !== params.cookie.toString()) {
        JSONResponse.message = 'This username is already taken. Please choose another username.';
        return respondJSON(request, response, 400, JSONResponse);
      }
    }
  }

  messages[messageIndexer] = {
    name: params.name, // Add the user's name
    message: params.message, // Add the user's message
  };
  messageIndexer++; // Increment the indexer

  etag = crypto.createHash('sha1').update(JSON.stringify(messages)); // Create a new hash object
  digest = etag.digest('hex'); // Recalculate the hash digest for the etag

  return respondJSON(request, response, 201, JSONResponse); // 201
};

module.exports = {
  getMessages,
  // getUsersHead,
  getNotReal,
  getNotRealHead,
  postMessage,
};
