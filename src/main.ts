import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'https://paineladm-navy.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const prisma = new PrismaClient();
  try {
    const adminExists = await prisma.user.findFirst();
    if (!adminExists) {
      await prisma.user.create({
        data: {
          id: 1,
          email: 'admin@teste.com',
          password: '$2b$10$EPf9ZThsc9N6E35Lg7wEcuvF1I9Psh1q9zDGlqY1R.tClyZ.O4w2C', // Mudou de senha para password
          // Deixei o tipo e o plano comentados com // para o compilador ignorar por enquanto se estiverem com nomes diferentes
          // tipo: 'ADMIN',
          // planoUser: 'ADMIN',
        }
      });
      console.log('USUÁRIO ADMIN CRIADO COM SUCESSO NO BANCO!');
    }
  } catch (e) {
    console.log('Erro ao tentar criar admin automático:', e);
  }

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
