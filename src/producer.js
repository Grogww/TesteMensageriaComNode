const { criarConexao, configurarBroker } = require('./rabbit');
const config = require('./config');

function obterArgumento(nome, padrao) {
  const argumento = process.argv.find(arg => arg.startsWith(`--${nome}=`));
  if (!argumento) return padrao;
  return argumento.split('=')[1];
}

function criarPedido(numero) {
  const itens = ['Hambúrguer Duplo com Bacon', 'Batata Frita Grande', 'Pizza Frango Catupiry', 'Suco Natural', 'X-Salada'];
  const item = itens[(numero - 1) % itens.length];
  const valor = [32.9, 18.5, 49.9, 12.0, 28.0][(numero - 1) % 5];

  return {
    pedido_id: 100 + numero,
    item,
    mesa: numero,
    cliente: `Cliente ${numero}`,
    valor,
    criado_em: new Date().toISOString()
  };
}

async function enviarPedidos() {
  const quantidade = Number(obterArgumento('count', '1'));
  const connection = await criarConexao();
  const channel = await connection.createChannel();

  await configurarBroker(channel);

  for (let i = 1; i <= quantidade; i++) {
    const pedido = criarPedido(i);

    const mensagemCozinha = {
      tipo: 'pedido_comida',
      pedido_id: pedido.pedido_id,
      item: pedido.item,
      mesa: pedido.mesa,
      cliente: pedido.cliente,
      criado_em: pedido.criado_em
    };

    const mensagemPagamento = {
      tipo: 'pedido_pagamento',
      pedido_id: pedido.pedido_id,
      mesa: pedido.mesa,
      cliente: pedido.cliente,
      valor: pedido.valor,
      criado_em: pedido.criado_em
    };

    channel.publish(
      config.exchange,
      config.routingKeys.comida,
      Buffer.from(JSON.stringify(mensagemCozinha)),
      { persistent: true, contentType: 'application/json' }
    );

    channel.publish(
      config.exchange,
      config.routingKeys.pagamento,
      Buffer.from(JSON.stringify(mensagemPagamento)),
      { persistent: true, contentType: 'application/json' }
    );

    console.log(`[PRODUTOR] Pedido ${pedido.pedido_id} enviado para cozinha e pagamento.`);
  }

  setTimeout(async () => {
    await channel.close();
    await connection.close();
    console.log('[PRODUTOR] Envio finalizado.');
  }, 500);
}

enviarPedidos().catch(error => {
  console.error('[PRODUTOR] Erro ao enviar pedidos:', error.message);
  process.exit(1);
});
