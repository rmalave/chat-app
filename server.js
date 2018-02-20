'use strict';

const net = require('net');
const EE = require('events');
const Client = require('./model/client.js');
const PORT = process.env.PORT || 3000;
const server = net.createServer();

const ee = new EE();
const pool = [];

ee.on('default', (client) => {
  client.socket.write('not a command - use an @ symbol\n');
});

ee.on('@all', (client, string) => {
  pool.forEach(c => {
    c.socket.write(`${client.nickname}: ${string}`);
  });
});

ee.on('@dm', (client, string) => {
  let nickname = string.split(' ').shift().trim();
  let message = string.split(' ').splice(1).join(' ').trim();

  pool.forEach(c => {
    if(c.nickname === nickname) {
      c.cocket.write(`${client.nickname}: ${message}`);
    }
  });
});

ee.on('@nickname', (client, string) => {
  let nickname = string.split(' ').shift().trim();
  client.nickname = nickname;
  client.socket.write(`user has changed nickname to ${nickname}\n`);
});

server.on('connection', (socket) => {
  let client = new Client(socket);
  pool.push(client);

  socket.on('data', data => {
    const command = data.toString().split(' ').shift().trim();
    if(command.startsWith('@')) {
      ee.emit(command, client, data.toString().split(' ').splice(1).join(' '));
      return;
    }
    ee.emit('default', client);
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

