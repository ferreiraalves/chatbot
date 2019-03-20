require('newrelic');
"use strict";

var express = require('express');
var app     = express();

app.listen(3000);

app.set('port', (process.env.PORT || 5000));
//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
  var result = 'App is running'
  response.send(result);
}).listen(app.get('port'), function() {
  console.log('App is running, server is listening on port ', app.get('port'));
});


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
      console.log(userSession.resource.sessionState);
      console.log(userSession.resource.sessionRating);
      if (m.type == 'text/plain' && m.content.toLowerCase().trim() == 'reset') {
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
        switch (userSession.resource.sessionState) {
          case 'Sair':
          if (m.type == 'text/plain'
          && (m.content.toLowerCase().trim() == "adorei"
          || m.content.toLowerCase().trim() == "gostei"
          || m.content.toLowerCase().trim() == "não gostei"
          || m.content.toLowerCase().trim() == "odiei")) {

            let command = {
              "id": Lime.Guid(),
              "method": "set",
              "uri": "/buckets/" + encodeURIComponent(m.from.split('/')[0]),
              "type": "application/json",
              "resource": {
                "sessionRating": m.content.toLowerCase().trim(),
                "sessionState": "Encerrada"

              }
            };

            client.sendCommand(command);


            message = {
              id: Lime.Guid(),
              type: 'text/plain',
              content: 'Obrigado por utilizar o ChatBot. A sessão será encerrada.',
              to: m.from
            };



            //Grava a sessão do usuário no servidor

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
          case 'Encerrada':

            if(m.type=='text/plain' && m.content.toLowerCase().trim()=='começar'){
              message = {
                id: Lime.Guid(),
                type: 'text/plain',
                content: 'Bem vindo(a) ao meu primeiro ChatBot. Utilize o menu à esquerda para selecionar a sua opção. Caso preferir, utilize a caixa de texto para digitar a opção desejada.',
                to: m.from
              };

              let command = {
                "id": Lime.Guid(),
                "method": "delete",
                "uri": "/buckets/" + encodeURIComponent(m.from.split('/')[0])
              };

              client.sendCommand(command);



            }
            else{
              message = {
                id: Lime.Guid(),
                type: 'text/plain',
                content: 'Sessão encerrada. Caso deseje abrir uma nova sessão selecione "Começar".',
                to: m.from
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
      else if (m.type == 'text/plain' && m.content.toLowerCase().trim() == 'começar') {
        message = {
          "id": Lime.Guid(),
          "to": m.from,
          "type": "text/plain",
          "content": "Bem vindo(a) ao meu primeiro ChatBot. Utilize o menu à esquerda para selecionar a sua opção. Caso preferir, utilize a caixa de texto para digitar a opção desejada."
        };
      }
      //O que sei fazer ?
      else if (m.type == 'text/plain' && m.content.toLowerCase().trim() == 'o que sei fazer') {
        message = {
          "id": Lime.Guid(),
          "to": m.from,
          "type": "text/plain",
          "content": "Olá eu sou o chatbot. Atualmente eu sei me apresentar, listar artigos interessantes sobre ChatBots, encerrar uma sessão, avaliar a experiência do usuário e apresentar o contato da Eteg caso seja pedido."
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
                "previewUri": "https://image.slidesharecdn.com/294017b2-bc98-4340-bfe2-75cb4e4c1ab9-170125180157/95/digital-customer-service-chatbot-latest-thinking-1-638.jpg?cb=1485367358",
                "title": "Chatbots in Customer Service",
                "text": "Artigo sobre a atuação de ChatBots no atendimento ao cliente. Apresenta pontos fortes, expectativas e realidades de sua utilização."
              },
              {
                "uri": "https://connect.innovateuk.org/documents/152301/3931510/Chatbots+for+Customer+Advantage.pdf/93587e08-35a1-4fb3-aedd-0942c743d23f?version=1.0",
                "previewUri": "https://i0.wp.com/internetofbusiness.com/wp-content/uploads/2016/02/innovate-uk.jpg?resize=350%2C200&ssl=1",
                "title": "Deploying Chatbots to Customer Advantage",
                "text": "Este artigo entra mais a fundo no que diz respeito as diversas utilizações possíveis dos ChatBots."
              },
              {
                "uri": "https://chatbotslife.com/ultimate-guide-to-leveraging-nlp-machine-learning-for-you-chatbot-531ff2dd870c",
                "previewUri": "https://cdn-images-1.medium.com/max/2000/1*5ZuLCsB1KXEPgHu-qJ8WxQ.png",
                "title": "Ultimate Guide to Leveraging NLP & Machine Learning for your Chatbot",
                "text": "Rápido overview de machine learning aplicado a ChatBots."
              },
              {
                "uri": "https://www.digitaltrends.com/cool-tech/artificial-intelligence-chatbots-are-revolutionizing-healthcare/",
                "previewUri": "https://icdn5.digitaltrends.com/image/yourmd-iphone-1200x0.jpg?ver=1",
                "title": "The chatbot will see you now: AI may play doctor in the future of healthcare ",
                "text": "Possíveis aplicações de ChatBot na área da saúde."
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
