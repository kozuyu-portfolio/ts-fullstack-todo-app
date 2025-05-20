import { ApiProperty } from '@nestjs/swagger'
import { Attachment } from '@prisma/client'
import { IsDate, IsString } from 'class-validator'

export class AttachmentModel {
    @ApiProperty({ type: String })
    @IsString()
    id!: string

    @ApiProperty({ type: String })
    @IsString()
    objectKey!: string

    @ApiProperty({ type: String })
    @IsString()
    filename!: string

    @ApiProperty({ type: String })
    @IsString()
    taskId!: string

    @ApiProperty({ type: Date })
    @IsDate()
    createdAt!: Date

    static fromPrisma(src: Attachment): AttachmentModel {
        return {
            ...src,
        }
    }
}
