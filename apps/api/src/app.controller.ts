import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { TodoService } from 'todo/todo.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly todo: TodoService
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('todos')
  getTodos() {
    return this.todo.findAll();
  }

  @Post('todos')
  createTodo(@Body('title') title: string) {
    return this.todo.create({ title });
  }
}
