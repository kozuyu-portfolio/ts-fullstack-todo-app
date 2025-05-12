import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TodoService } from './todo.service';
import { TodoModel } from '../model/todo.model';

@Controller('todos')
@ApiTags('todos')
export class TodoController {
    constructor(private readonly todo: TodoService) { }


    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiResponse({ type: TodoModel, isArray: true })
    getTodos() {
        return this.todo.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiResponse({ type: TodoModel })
    createTodo(@Body('title') title: string) {
        return this.todo.create({ title });
    }
}