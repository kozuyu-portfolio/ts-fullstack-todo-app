import { ApiProperty } from '@nestjs/swagger'

export class GetAttachmentResponseDto {
    @ApiProperty() url!: string
    @ApiProperty() filename!: string
}
