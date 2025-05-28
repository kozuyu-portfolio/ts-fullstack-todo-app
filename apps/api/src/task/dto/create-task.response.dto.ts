import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TaskStatus } from '@prisma/client'

export class CreateTaskResponseDto {
    @ApiProperty({ type: String })
    id!: string

    @ApiProperty({ type: String })
    title!: string

    @ApiProperty({ enum: TaskStatus })
    status!: TaskStatus

    @ApiPropertyOptional({ type: String, format: 'date-time' })
    deadline?: Date

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt!: Date

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt!: Date
}
