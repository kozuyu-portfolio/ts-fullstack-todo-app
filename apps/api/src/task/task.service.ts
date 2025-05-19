import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTaskRequestDto } from './dto/create-task.request.dto'
import { UpdateTaskRequestDto } from './dto/update-task.request.dto'

@Injectable()
export class TaskService {
    constructor(private readonly prisma: PrismaService) {}

    create(userId: string, dto: CreateTaskRequestDto) {
        return this.prisma.task.create({
            data: { ...dto, userId },
        })
    }

    findAll(userId: string) {
        return this.prisma.task.findMany({ where: { userId } })
    }

    findOne(userId: string, id: string) {
        return this.prisma.task.findFirst({ where: { id, userId } })
    }

    async update(userId: string, id: string, dto: UpdateTaskRequestDto) {
        const task = await this.prisma.task.findUnique({ where: { id } })
        if (!task || task.userId !== userId) {
            throw new ForbiddenException()
        }
        return this.prisma.task.update({ where: { id }, data: dto })
    }

    async remove(userId: string, id: string) {
        const task = await this.prisma.task.findUnique({ where: { id } })
        if (!task || task.userId !== userId) {
            throw new ForbiddenException()
        }
        await this.prisma.task.delete({ where: { id } })
        return { deleted: true }
    }
}
