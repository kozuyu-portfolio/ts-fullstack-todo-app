import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateTaskRequestDto {
    @ApiProperty({ type: String, description: 'タスクのタイトル' })
    @IsString()
    @IsNotEmpty()
    title!: string

    @ApiPropertyOptional({ type: Date, description: 'タスクの期限' })
    @IsDate()
    @IsOptional()
    deadline?: Date
}
