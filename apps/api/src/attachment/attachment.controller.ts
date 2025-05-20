import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthorizedUser } from '../auth/strategies/jwt.strategy'
import { JwtPayload } from '../model/auth.model'
import { AttachmentService } from './attachment.service'
import { CreateAttachmentRequestDto } from './dto/create-attachment.request.dto'
import { CreateAttachmentResponseDto } from './dto/create-attachment.response.dto'
import { GetAttachmentResponseDto } from './dto/get-attachment.response.dto'

@UseGuards(AuthGuard('jwt'))
@Controller('attachments')
@ApiTags('attachments')
export class AttachmentController {
    constructor(private readonly service: AttachmentService) {}

    @Post('create/:taskId')
    @ApiResponse({ type: CreateAttachmentResponseDto })
    create(
        @AuthorizedUser() user: JwtPayload,
        @Param('taskId') taskId: string,
        @Body() dto: CreateAttachmentRequestDto,
    ): Promise<CreateAttachmentResponseDto> {
        return this.service.create(user.sub, taskId, dto)
    }

    @Get(':attachmentId')
    @ApiResponse({ type: GetAttachmentResponseDto })
    getDownloadUrl(
        @AuthorizedUser() user: JwtPayload,
        @Param('attachmentId') attachmentId: string,
    ): Promise<GetAttachmentResponseDto> {
        return this.service.getDownloadUrl(user.sub, attachmentId)
    }
}
