const { criarConexao, configurarBroker } = require('./rabbit');
const config = require('./config');

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function iniciarConsumidorPagamento() {
  const connection = await criarConexao();
  const channel = await connection.createChannel();

  await configurarBroker(channel);
  channel.prefetch(1);

  console.log(`[PAGAMENTO] Aguardando cobranças na fila ${config.filaPagamento}...`);

  channel.consume(config.filaPagamento, async message => {
    if (!message) return;

    try {
      const pagamento = JSON.parse(message.content.toString());
      console.log(`[PAGAMENTO] Processando pedido ${pagamento.pedido_id} | valor R$ ${pagamento.valor.toFixed(2)}`);

      await esperar(1500);

      console.log(`[PAGAMENTO] Pagamento do pedido ${pagamento.pedido_id} aprovado.`);
      channel.ack(message);
    } catch (error) {
      console.error('[PAGAMENTO] Erro ao processar mensagem:', error.message);
      channel.nack(message, false, false);
    }
  });
}

iniciarConsumidorPagamento().catch(error => {
  console.error('[PAGAMENTO] Erro ao iniciar consumidor:', error.message);
  process.exit(1);
});
