import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Ativa o CORS para o seu painel da Vercel
  app.enableCros({
    origin: 'https://paineladm-navy.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // CÓDIGO MÁGICO: Cria o admin direto se ele não existir
  const prisma = new PrismaClient();
  try {
    const adminExists = await prisma.user.findFirst({ where: { tipo: 'ADMIN' } });
    if (!adminExists) {
      await prisma.user.create({
        data: {
          id: 'admin-automatico-123',
          email: 'admin@teste.com',
          nome: 'Admin',
          tipo: 'ADMIN',
          planoUser: 'ADMIN',
          // Esta é a senha '123456' já criptografada em Bcrypt para a API aceitar
          senha: '$2b$10$EPf9ZThsc9N6E35Lg7wEcuvF1I9Psh1q9zDGlqY1R.tClyZ.O4w2C',
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
