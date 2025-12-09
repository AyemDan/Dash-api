import 'dotenv/config';
import express from 'express';
import connect from './config/mongodb';
import cors from 'cors';
import authRoutes from './routes/auth';
import programRoutes from './routes/program';
import moduleRoutes from './routes/modules';
import participantRoutes from './routes/participant';
import importRoutes from './routes/import';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/imports', importRoutes);

app.get('/', (req, res) => res.json({ ok: true, message: 'participant mgmt API' }));

export default app;

/**
 * Start the DB connection and HTTP server.
 * Exported so tests can import app without starting the server.
 */
const DEFAULT_PORT = parseInt(process.env.PORT || '4000');
const ENV_MONGO_URI = process.env.MONGO_URI;

export async function startServer(options?: { port?: number; mongoUri?: string }) {
  const PORT = options?.port || DEFAULT_PORT;
  const MONGO_URI = options?.mongoUri || ENV_MONGO_URI;

  console.log(`Mongo URI: ${MONGO_URI}`);

  await connect(MONGO_URI);
  const server = app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch(err => {
    console.error('Failed to start server', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
  });
}
