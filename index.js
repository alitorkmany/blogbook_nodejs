const http = require('http');
const config = require('config');
const express = require('express');
const app = express();
const socketio = require('socket.io');
require('./startup/cors')(app);
require('./startup/logging')();
require('./startup/db')();
require('./startup/routers')(app);
const socket = require('./socketio/socketio');


if(!config.get('jwtPrivateKey')){
    console.log('FATAL ERROR: jwtprivatetoken is not defined');
    process.exit(1);
}

const server = http.createServer(app);

const io = socketio(server);
socket(io);

const port = process.env.port || 3000;

server.listen(port, () => console.log(`Litsining on port ${port} ...`));

exports = server;