import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpRequestDto } from './dto/signup.dto';
import { SignInRequestDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) { }

    @Post('signup')
    signup(@Body() dto: SignUpRequestDto) {
        return this.auth.signup(dto);
    }

    @Post('signin')
    signin(@Body() dto: SignInRequestDto) {
        return this.auth.signin(dto);
    }
}