import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

async function bootstrap() {
  dotenv.config(); // dotenv ile .env dosyasını yükleyin
  const httpsOptions = {
    key: fs.readFileSync('/etc/ssl_volume/domain_key.pem'),
    cert: fs.readFileSync('/etc/ssl_volume/domain_crt.pem'),
  };
  const app = await NestFactory.create(AppModule, {cors: true, httpsOptions });
  app.enableCors({ origin: '*' });

  // const app = await NestFactory.create<NestExpressApplication>(AppModule, {cors : true});

  // app.useStaticAssets(path.join(__dirname, '..', '..', 'Front'));
  // //for Swagger
  // const config = new DocumentBuilder()
  //   .setTitle('Nest API')
  //   .setDescription('the description of the API')
  //   .setVersion('1.0')
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('/swagger', app, document);

  // app.enableCors({ origin: 'http://10.12.14.1:3000' }); // React uygulamasının IP ve portunu ekleyin
  // app.enableCors({ origin: 'http://10.12.14.5:3000' }); // React uygulamasının IP ve portunu ekleyin
  await app.listen(80, '0.0.0.0');
}
bootstrap();
