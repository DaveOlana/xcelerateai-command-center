import { buildApp } from './app.js';
import { parseBackendEnvironment } from './config/env.js';
import { createPostgresDatabase } from './db/postgres.js';

const config = parseBackendEnvironment(process.env);
const database = createPostgresDatabase(config);
const app = await buildApp({ config, database, logger: config.NODE_ENV !== 'test' });

const close = async (signal: string) => {
  app.log.info({ signal }, 'shutting down');
  await app.close();
  process.exit(0);
};

process.once('SIGINT', () => void close('SIGINT'));
process.once('SIGTERM', () => void close('SIGTERM'));

try {
  await app.listen({ host: config.HOST, port: config.PORT });
} catch (error) {
  app.log.error(error);
  await app.close();
  process.exit(1);
}
