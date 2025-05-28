import { ApiPropertyOptional } from '@nestjs/swagger'
import { TaskStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator'

export class UpdateTaskRequestDto {
    @ApiPropertyOptional({ type: String })
    @IsString()
    @IsOptional()
    title?: string

    @ApiPropertyOptional({ enum: TaskStatus })
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus

    @ApiPropertyOptional({ type: Date })
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    deadline?: Date
}
