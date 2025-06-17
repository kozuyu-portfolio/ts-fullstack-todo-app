import { ApiProperty } from '@nestjs/swagger'

export class SignInResponseDto {
    @ApiProperty({ type: String })
    access_token!: string
}
