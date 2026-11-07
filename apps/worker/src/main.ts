import { Worker } from 'bullmq';

const redisUrl = new URL(process.env.REDIS_URL ?? 'redis://127.0.0.1:6379');

const worker = new Worker(
  'wessali-notifications',
  async (job) => {
    console.info('Notification job received', {
      id: job.id,
      name: job.name,
      note: 'Delivery provider integration is not configured yet.',
    });
  },
  {
    connection: {
      host: redisUrl.hostname,
      port: Number(redisUrl.port || 6379),
      username: redisUrl.username ? decodeURIComponent(redisUrl.username) : undefined,
      password: redisUrl.password ? decodeURIComponent(redisUrl.password) : undefined,
      maxRetriesPerRequest: null,
      ...(redisUrl.protocol === 'rediss:' ? { tls: {} } : {}),
    },
  },
);

worker.on('completed', (job) => {
  console.info('Notification job completed', job.id);
});

worker.on('failed', (job, error) => {
  console.error('Notification job failed', job?.id, error);
});

console.info('Wessali notification worker is listening.');

async function shutdown() {
  await worker.close();
  process.exit(0);
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
