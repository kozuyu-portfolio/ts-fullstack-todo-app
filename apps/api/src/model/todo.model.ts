import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Todo } from '@prisma/client'
import { IsBoolean, IsDate, IsInt, IsNumber, IsOptional, IsString } from 'class-validator'

export class TodoModel {
    @ApiProperty({ type: Number })
    @IsNumber()
    id!: number

    @ApiProperty({ type: String })
    @IsString()
    title!: string

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    description?: string

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    completed!: boolean

    @ApiProperty({ type: Date })
    @IsDate()
    createdAt!: Date

    @ApiProperty({ type: Date })
    @IsDate()
    updatedAt!: Date

    @ApiPropertyOptional({ type: Number })
    @IsOptional()
    @IsInt()
    userId?: number

    static fromPrisma(src: Todo): TodoModel {
        return {
            ...src,
            description: src.description ?? undefined,
            userId: src.userId ?? undefined,
        }
    }
}
