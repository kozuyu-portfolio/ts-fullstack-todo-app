import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { AccessTokenPayload } from '../../model/auth.model'

export const AuthorizedUser = createParamDecorator((_data: undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user as AccessTokenPayload
})
