require('dotenv').config();

module.exports = {
  rabbitUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  exchange: process.env.EXCHANGE_PEDIDOS || 'exchange_pedidos',
  filaCozinha: process.env.FILA_COZINHA || 'fila_cozinha',
  filaPagamento: process.env.FILA_PAGAMENTO || 'fila_pagamento',
  routingKeys: {
    comida: 'pedido.comida',
    pagamento: 'pedido.pagamento'
  }
};
