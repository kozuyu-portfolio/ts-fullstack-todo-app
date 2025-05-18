import { Body, Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthorizedUser } from '../auth/strategies/jwt.strategy'
import { JwtPayload } from '../model/auth.model'
import { AttachmentService } from './attachment.service'
import { CreateAttachmentRequestDto } from './dto/create-attachment.request.dto'
import { CreateAttachmentResponseDto } from './dto/create-attachment.response.dto'

@UseGuards(AuthGuard('jwt'))
@Controller('tasks/:id/attachments')
export class AttachmentController {
    constructor(private readonly service: AttachmentService) {}

    @Post()
    create(
        @AuthorizedUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreateAttachmentRequestDto,
    ): Promise<CreateAttachmentResponseDto> {
        return this.service.create(user.sub, id, dto)
    }
}
