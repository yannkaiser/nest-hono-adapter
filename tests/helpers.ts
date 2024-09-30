import { INestApplication } from '@nestjs/common';

export async function initApp(app: INestApplication) {
  await app.init();
  // await app.listen(3002, 'localhost', () => {});
  // request.setBaseUrl(await app.getUrl());
}
