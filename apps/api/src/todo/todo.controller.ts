import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { TodoModel } from '../model/todo.model'
import { TodoService } from './todo.service'

@Controller('todos')
@ApiTags('todos')
export class TodoController {
    constructor(private readonly todo: TodoService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiResponse({ type: TodoModel, isArray: true })
    getTodos() {
        return this.todo.findAll()
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiResponse({ type: TodoModel })
    createTodo(@Body('title') title: string) {
        return this.todo.create({ title })
    }
}
