import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClient } from '@prisma/client';
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

  // Configuração unificada do CORS do arquivo original + o link da sua Vercel
  app.enableCors({
    origin: [
      'https://paineladm-navy.vercel.app', // O seu painel da Vercel adicionado aqui
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

  // Script para criar o Admin usando os campos em inglês ('password' e 'role')
  const prisma = new PrismaClient();
  try {
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
          password: '$2b$10$EPf9ZThsc9N6E35Lg7wEcuvF1I9Psh1q9zDGlqY1R.tClyZ.O4w2C', // Senha '123456' em Bcrypt
          tipo: 'ADMIN',
          planoUser: 'ADMIN',
        } as any
      });
      console.log('USUÁRIO ADMIN CRIADO COM SUCESSO NO BANCO!');
    }
  } catch (e) {
    console.log('Tentando formato alternativo de campos...');
    try {
      // Segunda tentativa caso os campos do Edgar sejam estritamente em inglês
      await prisma.user.create({
        data: {
          id: 1,
          email: 'admin@teste.com',
          password: '$2b$10$EPf9ZThsc9N6E35Lg7wEcuvF1I9Psh1q9zDGlqY1R.tClyZ.O4w2C',
          role: 'ADMIN',
          plan: 'ADMIN',
        } as any
      });
      console.log('USUÁRIO ADMIN CRIADO COM SUCESSO (CAMPOS EM INGLÊS)!');
    } catch (err) {
      console.log('Aviso: Não foi possível criar o admin automaticamente:', err.message);
    }
  }

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
