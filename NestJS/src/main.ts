import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

async function bootstrap() {
  dotenv.config(); // dotenv ile .env dosyasını yükleyin
  
  //const httpsOptions = {
  //  key: fs.readFileSync('/etc/ssl_volume/domain_key.pem'),
  //  cert: fs.readFileSync('/etc/ssl_volume/domain_crt.pem'),
  //};
  //(FOR HTTPS)
  
  const app = await NestFactory.create(AppModule, {cors: true, /*httpsOptions (FOR HTTPS)*/ });
  app.enableCors({ origin: '*' });

  await app.listen(process.env.BACK_PORT, '0.0.0.0');
}
bootstrap();
