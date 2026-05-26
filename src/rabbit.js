const amqp = require('amqplib');
const config = require('./config');

async function criarConexao() {
  return amqp.connect(config.rabbitUrl);
}

async function configurarBroker(channel) {
  await channel.assertExchange(config.exchange, 'direct', { durable: true });

  await channel.assertQueue(config.filaCozinha, { durable: true });
  await channel.assertQueue(config.filaPagamento, { durable: true });

  await channel.bindQueue(config.filaCozinha, config.exchange, config.routingKeys.comida);
  await channel.bindQueue(config.filaPagamento, config.exchange, config.routingKeys.pagamento);
}

module.exports = {
  criarConexao,
  configurarBroker
};
