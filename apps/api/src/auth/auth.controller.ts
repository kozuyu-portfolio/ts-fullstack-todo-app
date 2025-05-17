import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { SignInRequestDto, SignInResponseDto } from './dto/signin.dto'
import { SignUpRequestDto, SignUpResponseDto } from './dto/signup.dto'

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {}

    @Post('signup')
    @ApiResponse({ type: SignUpResponseDto })
    signup(@Body() dto: SignUpRequestDto) {
        return this.auth.signup(dto)
    }

    @Post('signin')
    @HttpCode(200)
    @ApiResponse({ type: SignInResponseDto })
    signin(@Body() dto: SignInRequestDto) {
        return this.auth.signin(dto)
    }
}
