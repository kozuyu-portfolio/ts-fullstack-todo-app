import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class UpdateTaskRequestDto {
    @ApiPropertyOptional({ type: String })
    @IsString()
    @IsOptional()
    title?: string

    @ApiPropertyOptional({ type: Boolean })
    @IsBoolean()
    @IsOptional()
    isDone?: boolean
}
