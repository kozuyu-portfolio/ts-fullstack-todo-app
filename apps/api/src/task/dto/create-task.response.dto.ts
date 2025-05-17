import { ApiProperty } from '@nestjs/swagger'

export class CreateTaskResponseDto {
    @ApiProperty({ type: Number })
    id!: number

    @ApiProperty({ type: String })
    title!: string

    @ApiProperty({ type: Boolean })
    isDone!: boolean

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt!: Date

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt!: Date
}
