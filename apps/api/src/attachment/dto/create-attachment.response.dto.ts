import { ApiProperty } from '@nestjs/swagger'

export class CreateAttachmentResponseDto {
    @ApiProperty({ type: String })
    url!: string

    @ApiProperty({ type: String })
    key!: string
}
