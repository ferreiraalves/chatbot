"use strict";

//limpa a sting, itera as palavras e verifica se uma delas é "contato"

function checkContato(string) {
  var punctuationless = string.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/,"");
  var words = punctuationless.split(" ");
  for (var i = 0; i<words.length; i+=1){
    if (words[i].toLowerCase()=="contato"){
      return true;
    }
  }
}

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

        //Toda mensagem que chegar vai ser logada no console
        client.addMessageReceiver((m) => true, (m) => {
            console.log(m);
            console.log(m.content.toLowerCase().trim());
            //Passa a execução para o proximo receiver.
            return true;
        });

        //Recebe todas as mensagens
        client.addMessageReceiver((m) => true, (m) => {
            let command = {
                "id": Lime.Guid(),
                "method": "get",
                "uri": "/buckets/" + encodeURIComponent(m.from.split('/')[0])
            };

            client.sendCommand(command)
                .then(userSession => {
                    if (m.type == 'text/plain' && m.content.toLowerCase().trim() == 'menu') {
                        let command = {
                            "id": Lime.Guid(),
                            "method": "delete",
                            "uri": "/buckets/" + encodeURIComponent(m.from.split('/')[0])
                        };

                        client.sendCommand(command);

                        let message = {
                            id: Lime.Guid(),
                            type: 'text/plain',
                            content: 'Reset',
                            to: m.from
                        };

                        client.sendMessage(message);
                    }
                    else {
                        let message = null;

                        console.log(userSession.resource.sessionState);
                        console.log(userSession.resource.sessionRating);
                        switch (userSession.resource.sessionState) {

                            case 'Sair':
                            if (m.type == 'text/plain'
                                && (m.content.toLowerCase().trim() == 'adorei'
                                    || m.content.toLowerCase().trim() == 'gostei'
                                    || m.content.toLowerCase().trim() == 'não gostei'
                                    || m.content.toLowerCase().trim() == 'odiei')) {

                                let command = {
                                    "id": Lime.Guid(),
                                    "method": "set",
                                    "uri": "/buckets/" + encodeURIComponent(m.from.split('/')[0]),
                                    "type": "application/json",
                                    "resource": {
                                        "sessionRating": m.content.toLowerCase().trim()

                                    }
                                };

                                client.sendCommand(command);

                                if (m.content.toLowerCase().trim() == 'adorei'
                                    || m.content.toLowerCase().trim() == 'gostei'
                                    || m.content.toLowerCase().trim() == 'não gostei'
                                    || m.content.toLowerCase().trim() == 'odiei') {
                                    message = {
                                        "id": Lime.Guid(),
                                        "to": m.from,
                                        "type": "application/vnd.lime.select+json",
                                        "content": {
                                            "text": "Obrigado pela Avaliação.",
                                            "options": [
                                                {

                                                    "text": "Encerrar Sessão"
                                                }
                                            ]
                                        }
                                    };

                                }
                            }
                            else {
                              message = {
                                  "id": Lime.Guid(),
                                  "to": m.from,
                                  "type": "application/vnd.lime.select+json",
                                  "content": {
                                      "text": "Opção invalida. Por favor avalie o chatbot.",
                                      "options": [
                                          {
                                              "text": "Adorei"
                                          },
                                          {
                                              "text": "Gostei"
                                          },
                                          {
                                              "text": "Não Gostei"
                                          },
                                          {
                                              "text": "Odiei"
                                          }
                                      ]
                                  }
                              };
                            }
                            break;

                        };

                        client.sendMessage(message);
                    }
                })
                .catch((err) => {
                    let message = {};

                    if (m.type == 'text/plain' && m.content.toLowerCase().trim() == 'sair') {
                        message = {
                            "id": Lime.Guid(),
                            "to": m.from,
                            "type": "application/vnd.lime.select+json",
                            "content": {
                                "text": "Obrigado por utilizar o meu primeiro Chatbot. Por favor avalie sua experiência.",
                                "options": [
                                    {
                                        "text": "Adorei"
                                    },
                                    {
                                        "text": "Gostei"
                                    },
                                    {
                                        "text": "Não Gostei"
                                    },
                                    {
                                        "text": "Odiei"
                                    }
                                ]
                            }
                        };

                        let command = {
                            "id": Lime.Guid(),
                            "method": "set",
                            "uri": "/buckets/" + encodeURIComponent(m.from.split('/')[0]),
                            "type": "application/json",
                            "resource": {
                                "sessionState": "Sair"
                            }
                        };

                        //Grava a sessão do usuário no servidor
                        client.sendCommand(command);
                    }
                    //contato
                    else if (m.type == 'text/plain' && checkContato(m.content)) {
                        message = {
                            "id": Lime.Guid(),
                            "to": m.from,
                            "type": "application/vnd.lime.collection+json",
                            "content": {
                                "itemType": "text/plain",
                                "items":[
                                  "Telefone: +55 (31) 3889-0990",
                                  "Email: international@eteg.com.br",
                                  "Site: https://www.eteg.com.br/"


                                ]
                            }
                        };
                    }

                    //O que sei fazer ?
                    else if (m.type == 'text/plain' && m.content.toLowerCase().trim() == 'o que sei fazer?') {
                        message = {
                            "id": Lime.Guid(),
                            "to": m.from,
                            "type": "text/plain",
                            "content": "Olá eu sou o chatbot. Atualmente eu sei me apresentar, listar artigos interessantes sobre Chatbots, encerrar uma sessão e avaliar a experiência do usuário"
                        };
                    }

                    else if (m.type == 'text/plain' && m.content.toLowerCase().trim() == 'defesa do uso do chatbot') {
                        message = {
                            "id": Lime.Guid(),
                            "to": m.from,
                            "type": "application/vnd.lime.collection+json",
                            "content": {
                                "itemType": "application/vnd.lime.web-link+json",
                                "items":[
                                  {
                                    "uri": "https://www.accenture.com/t00010101T000000__w__/br-pt/_acnmedia/PDF-45/Accenture-Chatbots-Customer-Service.pdf",
                                    "title": "Artigo1",
                                    "text": "Artigo sobre bla bla bla bla",
                                    "target": "selfCompact"
                                  }

                                ]
                            }
                        };
                    }


                    else {
                        message = {
                            id: Lime.Guid(),
                            type: 'text/plain',
                            content: 'Desculpe,não entendi. Você pode tentar de novo?',
                            to: m.from
                        };
                    }

                    client.sendMessage(message);
                });
        });
    })
    .catch((err) => console.error(err));;
