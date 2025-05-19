import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiResponse } from '@nestjs/swagger'
import { plainToInstance } from 'class-transformer'
import { AuthorizedUser } from '../auth/strategies/jwt.strategy'
import { JwtPayload } from '../model/auth.model'
import { CreateTaskRequestDto } from './dto/create-task.request.dto'
import { CreateTaskResponseDto } from './dto/create-task.response.dto'
import { TaskResponseDto } from './dto/task.response.dto'
import { UpdateTaskRequestDto } from './dto/update-task.request.dto'
import { TaskService } from './task.service'

@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post()
    @ApiResponse({ type: CreateTaskResponseDto })
    async create(
        @AuthorizedUser() user: JwtPayload,
        @Body() dto: CreateTaskRequestDto,
    ): Promise<CreateTaskResponseDto> {
        const task = await this.taskService.create(user.sub, dto)
        return plainToInstance(CreateTaskResponseDto, task)
    }

    @Get()
    @ApiResponse({ type: [TaskResponseDto] })
    async findAll(@AuthorizedUser() user: JwtPayload): Promise<TaskResponseDto[]> {
        const tasks = await this.taskService.findAll(user.sub)
        return tasks.map((t) => plainToInstance(TaskResponseDto, t))
    }

    @Get(':id')
    @ApiResponse({ type: TaskResponseDto })
    async findOne(@AuthorizedUser() user: JwtPayload, @Param('id', ParseIntPipe) id: string): Promise<TaskResponseDto> {
        const task = await this.taskService.findOne(user.sub, id)
        return plainToInstance(TaskResponseDto, task)
    }

    @Patch(':id')
    @ApiResponse({ type: TaskResponseDto })
    async update(
        @AuthorizedUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: string,
        @Body() dto: UpdateTaskRequestDto,
    ): Promise<TaskResponseDto> {
        const task = await this.taskService.update(user.sub, id, dto)
        return plainToInstance(TaskResponseDto, task)
    }

    @Delete(':id')
    @ApiResponse({ type: Boolean })
    remove(@AuthorizedUser() user: JwtPayload, @Param('id', ParseIntPipe) id: string) {
        return this.taskService.remove(user.sub, id)
    }
}
