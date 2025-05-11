import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpRequestDto, SignUpResponseDto } from './dto/signup.dto';
import { SignInRequestDto, SignInResponseDto } from './dto/signin.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) { }

    @Post('signup')
    @ApiResponse({ type: SignUpResponseDto })
    signup(@Body() dto: SignUpRequestDto) {
        return this.auth.signup(dto);
    }

    @Post('signin')
    @ApiResponse({ type: SignInResponseDto })
    signin(@Body() dto: SignInRequestDto) {
        return this.auth.signin(dto);
    }
}