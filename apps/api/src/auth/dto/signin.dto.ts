import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignInRequestDto {
    @ApiProperty({ type: String })
    @IsEmail()
    email!: string;

    @ApiProperty({ type: String })
    @IsString()
    password!: string;
}

export class SignInResponseDto {
    @ApiProperty({ type: String })
    @IsString()
    access_token!: string;
}