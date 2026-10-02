import { createApplication } from './app';

async function bootstrap() {
  const { app } = await createApplication();
  await app.listen(
    Number(process.env.API_PORT ?? process.env.PORT ?? 3001),
    process.env.API_HOST ?? '127.0.0.1',
  );
}
void bootstrap().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
