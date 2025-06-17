import { ApiProperty } from '@nestjs/swagger'

export class RefreshResponseDto {
    @ApiProperty({ type: String })
    access_token!: string
}
