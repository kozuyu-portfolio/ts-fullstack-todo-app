import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { TodoService } from 'todo/todo.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly todo: TodoService
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('todos')
  getTodos() {
    return this.todo.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('todos')
  createTodo(@Body('title') title: string) {
    return this.todo.create({ title });
  }
}
