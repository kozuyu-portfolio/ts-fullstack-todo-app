import { ApiProperty } from '@nestjs/swagger'
import { IsObject } from 'class-validator'
import { AttachmentModel } from 'model/attachment.model'

type AttachmentPropertiesInDto = Pick<AttachmentModel, 'id' | 'filename' | 'createdAt'>

class AttachmentInDto implements AttachmentPropertiesInDto {
    @ApiProperty({ type: String })
    id!: string

    @ApiProperty({ type: String })
    filename!: string

    @ApiProperty({ type: Date })
    createdAt!: Date
}

export class TaskResponseDto {
    @ApiProperty({ type: String })
    id!: number

    @ApiProperty({ type: String })
    title!: string

    @ApiProperty({ type: Boolean })
    isDone!: boolean

    @ApiProperty({ type: AttachmentInDto, isArray: true })
    @IsObject({ each: true })
    attachments!: AttachmentInDto[]

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt!: Date

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt!: Date
}
