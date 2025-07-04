const fastify = require('fastify')({ logger: true });
const path = require('path');

// Serve static files from the verbs_00 directory
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'verbs_00'),
  prefix: '/', // Serve at http://localhost:3000/
});

fastify.get('/', (request, reply) => {
  reply.sendFile('index.html');
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info(`Server running at http://localhost:3000/`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 