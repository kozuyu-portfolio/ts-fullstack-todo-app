import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { strategyNames } from 'auth/constants'

@Injectable()
export class AccessTokenGuard extends AuthGuard(strategyNames.access) {}
