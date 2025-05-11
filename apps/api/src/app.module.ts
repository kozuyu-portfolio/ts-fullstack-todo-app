import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { TodoService } from 'todo/todo.service';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService, TodoService],
})
export class AppModule { }
