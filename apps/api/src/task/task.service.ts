import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTaskRequestDto } from './dto/create-task.request.dto'
import { UpdateTaskRequestDto } from './dto/update-task.request.dto'

@Injectable()
export class TaskService {
    constructor(private readonly prisma: PrismaService) {}

    create(userId: number, dto: CreateTaskRequestDto) {
        return this.prisma.task.create({
            data: { ...dto, userId },
        })
    }

    findAll(userId: number) {
        return this.prisma.task.findMany({ where: { userId } })
    }

    findOne(userId: number, id: number) {
        return this.prisma.task.findFirst({ where: { id, userId } })
    }

    async update(userId: number, id: number, dto: UpdateTaskRequestDto) {
        const task = await this.prisma.task.findUnique({ where: { id } })
        if (!task || task.userId !== userId) {
            throw new ForbiddenException()
        }
        return this.prisma.task.update({ where: { id }, data: dto })
    }

    async remove(userId: number, id: number) {
        const task = await this.prisma.task.findUnique({ where: { id } })
        if (!task || task.userId !== userId) {
            throw new ForbiddenException()
        }
        await this.prisma.task.delete({ where: { id } })
        return { deleted: true }
    }
}
