import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { strategyNames } from 'auth/constants'

@Injectable()
export class RefreshTokenGuard extends AuthGuard(strategyNames.refresh) {}
