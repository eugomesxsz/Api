import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'https://paineladm-navy.vercel.app',
      'http://localhost:8081',
      'http://172.17.240.1:8081',
      'http://localhost:3000',
      'http://172.17.240.1:3000',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
    credentials: true,
  });

  // RESOLVIDO: Puxando a conexão correta e já configurada do próprio NestJS
  try {
    // Procuramos o PrismaService dinamicamente dentro dos módulos injetados
    const prisma = app.get('PrismaService' as any) || app.get('PrismaClient' as any);
    
    if (prisma && prisma.user) {
      const adminExists = await prisma.user.findFirst({
        where: {
          OR: [
            { tipo: 'ADMIN' },
            { role: 'ADMIN' }
          ]
        } as any
      });

      if (!adminExists) {
        await prisma.user.create({
          data: {
            id: 1,
            email: 'admin@teste.com',
            password: '$2b$10$EPf9ZThsc9N6E35Lg7wEcuvF1I9Psh1q9zDGlqY1R.tClyZ.O4w2C', // Senha '123456'
            tipo: 'ADMIN',
            planoUser: 'ADMIN',
          } as any
        });
        console.log('USUÁRIO ADMIN CRIADO COM SUCESSO NO BANCO!');
      }
    }
  } catch (e: any) {
    console.log('Aviso: Pulando criação automática de admin:', e.message);
  }

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
