import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { AccessTokenGuard } from './access-token.guard'

@Injectable()
export class GlobalAccessTokenGuard extends AccessTokenGuard {
    constructor(private reflector: Reflector) {
        super()
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ])
        if (isPublic) {
            return true
        }
        return super.canActivate(context)
    }
}
