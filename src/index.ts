import dotenv from 'dotenv';

dotenv.config();

import { createApp, createContainer } from './app';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const container = createContainer();
    const app = createApp(container);

    const shutdown = async () => {
      console.log('Shutting down gracefully...');
      await container.prisma.$disconnect();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
