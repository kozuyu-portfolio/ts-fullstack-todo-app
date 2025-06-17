import { ApiProperty } from '@nestjs/swagger'

export class SignUpResponseDto {
    @ApiProperty({ type: String })
    access_token!: string
}
