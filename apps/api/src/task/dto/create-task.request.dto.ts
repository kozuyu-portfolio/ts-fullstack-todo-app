import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TaskStatus } from '@prisma/client'
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateTaskRequestDto {
    @ApiProperty({ type: String, description: 'タスクのタイトル' })
    @IsString()
    @IsNotEmpty()
    title!: string

    @ApiPropertyOptional({ enum: TaskStatus, description: 'タスクのステータス' })
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus

    @ApiPropertyOptional({ type: Date, description: 'タスクの期限' })
    @IsDate()
    @IsOptional()
    deadline?: Date
}
