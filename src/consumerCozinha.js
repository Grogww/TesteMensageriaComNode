const { criarConexao, configurarBroker } = require('./rabbit');
const config = require('./config');

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function iniciarConsumidorCozinha() {
  const connection = await criarConexao();
  const channel = await connection.createChannel();

  await configurarBroker(channel);
  channel.prefetch(1);

  console.log(`[COZINHA] Aguardando pedidos na fila ${config.filaCozinha}...`);

  channel.consume(config.filaCozinha, async message => {
    if (!message) return;

    try {
      const pedido = JSON.parse(message.content.toString());
      console.log(`[COZINHA] Preparando pedido ${pedido.pedido_id}: ${pedido.item} | mesa ${pedido.mesa}`);

      await esperar(2500);

      console.log(`[COZINHA] Pedido ${pedido.pedido_id} pronto.`);
      channel.ack(message);
    } catch (error) {
      console.error('[COZINHA] Erro ao processar mensagem:', error.message);
      channel.nack(message, false, false);
    }
  });
}

iniciarConsumidorCozinha().catch(error => {
  console.error('[COZINHA] Erro ao iniciar consumidor:', error.message);
  process.exit(1);
});
