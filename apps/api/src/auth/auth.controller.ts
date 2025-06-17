import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { AccessTokenPayload, RefreshTokenPayload } from '../model/auth.model'
import { AuthService } from './auth.service'
import { AuthorizedUser } from './decorators/authorized-user.decorator'
import { Public } from './decorators/public.decorator'
import { RefreshResponseDto } from './dto/refresh.response.dto'
import { SignInRequestDto } from './dto/signin.request.dto'
import { SignInResponseDto } from './dto/signin.response.dto'
import { SignUpRequestDto } from './dto/signup.request.dto'
import { SignUpResponseDto } from './dto/signup.response.dto'
import { RefreshTokenGuard } from './guards/refresh-token.guard'

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {}

    @Public()
    @Post('signup')
    @ApiResponse({ type: SignUpResponseDto })
    async signup(@Body() dto: SignUpRequestDto, @Res({ passthrough: true }) res: Response): Promise<SignUpResponseDto> {
        const tokens = await this.auth.signup(dto)
        this.setRefreshTokenCookie(res, tokens.refresh_token)
        return { access_token: tokens.access_token }
    }

    @Public()
    @Post('signin')
    @HttpCode(200)
    @ApiResponse({ type: SignInResponseDto })
    async signin(@Body() dto: SignInRequestDto, @Res({ passthrough: true }) res: Response): Promise<SignInResponseDto> {
        const tokens = await this.auth.signin(dto)
        this.setRefreshTokenCookie(res, tokens.refresh_token)
        return { access_token: tokens.access_token }
    }

    @Public()
    @Get('refresh')
    @UseGuards(RefreshTokenGuard)
    @ApiResponse({ type: RefreshResponseDto })
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<RefreshResponseDto> {
        const tokens = await this.auth.refresh(req.cookies.refresh_token)
        this.setRefreshTokenCookie(res, tokens.refresh_token)
        return { access_token: tokens.access_token }
    }

    @Get('signout')
    async signout(
        @AuthorizedUser() user: AccessTokenPayload,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<void> {
        const { refresh_token: refreshToken } = req.cookies
        if (!refreshToken) {
            console.warn('No refresh token found in cookies during signout')
            return
        }

        const decoded = jwt.decode(refreshToken) as RefreshTokenPayload
        const { sub: userId, jti } = decoded
        await this.auth.signout(userId, jti)
        this.clearRefreshTokenCookie(res)
    }

    private setRefreshTokenCookie(res: Response, refreshToken: string) {
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
    }

    private clearRefreshTokenCookie(res: Response) {
        res.clearCookie('refresh_token')
    }
}
