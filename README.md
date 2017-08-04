# ChatBot

### Introdução
Este chatbot foi criado durante a primeira etapa do processo seletivo da Eteg Technologies.

### Especificações
- Menu
	- Começar: Dá boas vindas e instruções de utilização ao usuário.
	- O que sei fazer: retorna o objetivo e as capacidades do Bot. (2a)
	- Defesa do uso de ChatBot: lista links para artigos que defendem a utilização de ChatBots. (2b)
	- Contato: retorna o contato e o site da Eteg Technologies. Esse menu é acessado sempre que a palavra "contato" for encontrada no conteúdo da mensagem de entrada. (4)
	- Sair: Dá inicio ao processo de encerramento de sessão e avaliação:
		- Avaliação:
			- São apresentadas quatro opções ou "ratings" para o sistema. Após a escolha do usuário a sessão é encerrada. Este estado se mantêm até que uma escolha válida seja feita. (3)
		- Sessão Encerrada:
			-   Neste estado os demais comandos não são mais acessíveis. A opção "Começar" deve ser escolhida para reiniciar a sessão.

###Proposta de melhoria
As técnicas utilizadas para atender ao requisito 3 poderiam ser, em um projeto futuro, utilizadas em conjunto com conceitos de Machine Learning para classificar o tipo de atendimento desejado de maneira mais natural. No entanto, seria necessário um data set considerável para realizar o treinamento e otimização dos parâmetros.
