import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateTaskRequestDto {
    @ApiProperty({ type: String, description: 'タスクのタイトル' })
    @IsString()
    @IsNotEmpty()
    title!: string
}
