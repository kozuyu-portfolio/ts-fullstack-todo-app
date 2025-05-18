import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateAttachmentRequestDto {
    @ApiProperty({ type: String })
    @IsString()
    filename!: string
}
