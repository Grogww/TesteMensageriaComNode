# Restaurante Digital com RabbitMQ, Node.js e Docker

Projeto para o experimento prático de mensageria com RabbitMQ. [Link do Repo](https://github.com/Grogww/TesteMensageriaComNode)

## Ideia do projeto

O sistema simula um restaurante digital:

- **Produtor:** App do Cliente, que envia pedidos em JSON.
- **Exchange:** `exchange_pedidos`, responsável por rotear as mensagens.
- **Fila 1:** `fila_cozinha`, consumida pelo serviço da cozinha.
- **Fila 2:** `fila_pagamento`, consumida pelo serviço financeiro.
- **RabbitMQ:** roda em Docker com painel web em `http://localhost:15672`.

Cada pedido enviado pelo produtor gera duas mensagens:

1. Uma mensagem de comida para a cozinha.
2. Uma mensagem de pagamento para o financeiro.

## Requisitos

- Node.js instalado.
- Docker instalado.
- npm instalado.

## Como executar

### 1. Subir o RabbitMQ com Docker

```bash
docker compose up -d
```

Painel web do RabbitMQ:

```text
http://localhost:15672
```

Usuário e senha:

```text
guest / guest
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Enviar mensagens pelo produtor

Enviar 1 pedido:

```bash
npm run send
```

Enviar 5 pedidos:

```bash
npm run send:5
```

### 4. Rodar consumidores

Rodar os dois consumidores juntos:

```bash
npm start
```

Ou rodar separadamente em terminais diferentes:

```bash
npm run consumer:cozinha
```

```bash
npm run consumer:pagamento
```

## Teste de desacoplamento

Este teste atende ao requisito de desligar o consumidor, enviar mensagens e depois ligar novamente.

### Passo 1: Deixe os consumidores desligados

Não execute `npm start` neste momento.

### Passo 2: Envie 5 pedidos

```bash
npm run send:5
```

Como cada pedido gera duas mensagens, o esperado é:

- 5 mensagens em `fila_cozinha`.
- 5 mensagens em `fila_pagamento`.

### Passo 3: Abra o painel do RabbitMQ

Acesse:

```text
http://localhost:15672
```

Entre com:

```text
guest / guest
```

Vá em **Queues and Streams** e confira as filas:

- `fila_cozinha`
- `fila_pagamento`

Na coluna **Ready**, devem aparecer as mensagens acumuladas.

### Passo 4: Ligue os consumidores

```bash
npm start
```

As mensagens serão processadas em sequência. No painel web, o valor de mensagens acumuladas deve diminuir até chegar a zero.

## Comandos úteis

Parar o RabbitMQ:

```bash
docker compose down
```

Parar e remover volume com dados antigos:

```bash
docker compose down -v
```

Ver logs do container:

```bash
docker logs restaurante-rabbitmq
```

## Estrutura

```text
restaurante-rabbitmq/
├── docker-compose.yml
├── package.json
├── README.md
└── src/
    ├── config.js
    ├── rabbit.js
    ├── producer.js
    ├── consumerCozinha.js
    └── consumerPagamento.js
```
