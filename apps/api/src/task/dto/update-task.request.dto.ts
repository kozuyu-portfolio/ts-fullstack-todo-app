import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator'

export class UpdateTaskRequestDto {
    @ApiPropertyOptional({ type: String })
    @IsString()
    @IsOptional()
    title?: string

    @ApiPropertyOptional({ type: Boolean })
    @IsBoolean()
    @IsOptional()
    isDone?: boolean

    @ApiPropertyOptional({ type: Date })
    @IsDate()
    @IsOptional()
    deadline?: Date
}
