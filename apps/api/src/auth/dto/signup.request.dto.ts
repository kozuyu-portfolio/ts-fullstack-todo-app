import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class SignUpRequestDto {
    @ApiProperty({ type: String })
    @IsEmail()
    email!: string

    @ApiProperty({ type: String })
    @IsString()
    @MinLength(6)
    password!: string
}
