import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TodoService {
    constructor(private readonly prisma: PrismaService) { }

    findAll() {
        return this.prisma.todo.findMany();
    }

    create(data: Prisma.TodoCreateInput) {
        return this.prisma.todo.create({ data });
    }
}