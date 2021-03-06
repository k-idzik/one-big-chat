// Built on the structure of HTTP-Assignment-II by Cody Van De Mark

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
// Updates the client with messages from other users
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

// getInfo GET
// Handles commands, responds as the API
// Also handles user management if this user
// is not already registered
// Also handle cases where users already exist
const getInfo = (request, response, params) => {
  messages[messageIndexer] = {
    name: 'One-Big-Chat API', // Add the user's name
    message: 'You should never see this spooky message.', // Add the user's message
  };

  // Generic response, preparing for an error
  const JSONResponse = {
    message: params.message,
    cookie: params.cookie,
    newUser: 0,
    messages,
    messageIndexer,
  };

  // These catch if a user is getting info without having posted a message,
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
    if (users[i].name.toString().toLowerCase() === params.name.toString().toLowerCase()
        && users[i].name.toString().toLowerCase() !== params.cookie.toString().toLowerCase()) {
      JSONResponse.message = 'This username is already taken. Please choose another username.';
      return respondJSON(request, response, 400, JSONResponse);
    }
  }

  // Check if user has cookie from previous login, use that
  let isUserReturning = false;
  for (let i = 0; i < usersIndexer; i++) {
    if (users[i].name.toString().toLowerCase() === params.cookie.toString().toLowerCase()) {
      isUserReturning = true;
      break;
    }
  }

  // The user has a cookie or is a new user
  if (!isUserReturning || params.cookie.toString() === '') {
    // New user
    JSONResponse.cookie = params.name;

    // Store this user's cookie
    users[usersIndexer] = {
      name: params.name,
    };
    usersIndexer++; // Increment the indexer
    JSONResponse.newUser = 1;
  }

  // Bad parameters
  if (params.numCommands > 2) {
    JSONResponse.message = 'Too many arguments in command!';
    return respondJSON(request, response, 400, JSONResponse);
  }

  // Info commands
  if (params.message === '/info') {
    if (params.command === 'numUsers') {
      messages[messageIndexer].message = usersIndexer;

      if (isUserReturning) {
        JSONResponse.newUser = 2; // Returning user, force scroll
      }
    } else if (params.command === 'getUsers') {
      messages[messageIndexer].message = 'Users: ';

      for (let i = 0; i < usersIndexer; i++) {
        messages[messageIndexer].message += `${users[i].name}, `;
      }

      if (isUserReturning) {
        JSONResponse.newUser = 2; // Returning user, force scroll
      }
    } else if (params.command === 'noParameter') {
      JSONResponse.message = '/info requires a valid parameter!';
      return respondJSON(request, response, 400, JSONResponse);
    } else {
      JSONResponse.message = `${params.command} is not a valid parameter!`;
      return respondJSON(request, response, 400, JSONResponse);
    }
  } else if (params.message === '/help') {
    // Not even going to worry about other parameters
    messages[messageIndexer].message = 'Commands:\n/info {parameter}: ';
    messages[messageIndexer].message += 'this command takes one parameter, "numUsers" or "getUsers"';

    if (isUserReturning) {
      JSONResponse.newUser = 2; // Returning user, force scroll
    }
  } else {
    JSONResponse.message = `${params.message} is not a command!`;
    return respondJSON(request, response, 400, JSONResponse);
  }

  messageIndexer++; // Increment the indexer

  // Update response information
  JSONResponse.messages = messages;
  JSONResponse.messageIndexer = messageIndexer;

  etag = crypto.createHash('sha1').update(JSON.stringify(messages)); // Create a new hash object
  digest = etag.digest('hex'); // Recalculate the hash digest for the etag

  return respondJSON(request, response, 200, JSONResponse); // 200
};

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
// Posts messages, add users if they are not registered
// Also handle cases where users already exist
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
    if (users[i].name.toString().toLowerCase() === params.name.toString().toLowerCase()
        && users[i].name.toString().toLowerCase() !== params.cookie.toString().toLowerCase()) {
      JSONResponse.message = 'This username is already taken. Please choose another username.';
      return respondJSON(request, response, 400, JSONResponse);
    }
  }

  // Check if user has cookie from previous login, use that
  let isUserReturning = false;
  for (let i = 0; i < usersIndexer; i++) {
    if (users[i].name.toString().toLowerCase() === params.cookie.toString().toLowerCase()) {
      isUserReturning = true;
      break;
    }
  }

  // The user has a cookie or is a new user
  if (!isUserReturning || params.cookie.toString() === '') {
    // New user
    JSONResponse.cookie = params.name;

    // Store this user's cookie
    users[usersIndexer] = {
      name: params.name,
    };
    usersIndexer++; // Increment the indexer
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
  getInfo,
  getNotReal,
  getNotRealHead,
  postMessage,
};
