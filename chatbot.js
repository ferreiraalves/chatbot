let MessagingHub = require('messaginghub-client');
let WebSocketTransport = require('lime-transport-websocket');
let Lime = require('lime-js');


let client = new MessagingHub.ClientBuilder()
    .withIdentifier('myfirstchatbot')
    .withAccessKey('SHBWRXczTXZ3dmVQaTdLcXFUYzE=')
    .withTransportFactory(() => new WebSocketTransport())
    .build();

    client.connect()
    .then(() => {
      console.log('BOT CONNECTADO!');

      client.addMessageReceiver((m) => true, (m) => {
        let message = {
          id: Lime.Guid(),
          type: 'text/plain',
          content: 'Pong!!!',
          to: m.from
        }

        client.sendMessage(message);
      });





    });
