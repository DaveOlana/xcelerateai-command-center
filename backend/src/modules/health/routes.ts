import type { FastifyInstance } from 'fastify';
import type { Database } from '../../db/database.js';

export async function registerHealthRoutes(app: FastifyInstance, database: Database): Promise<void> {
  app.get('/healthz', async () => ({ status: 'ok' }));

  app.get('/readyz', async (_request, reply) => {
    try {
      await database.query('SELECT 1');
      return { status: 'ready' };
    } catch {
      return reply.status(503).send({ status: 'not_ready', dependency: 'database' });
    }
  });
}
