import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import { Injectable, Logger } from '@nestjs/common'
import nodemailer from 'nodemailer'
import { PrismaService } from '../prisma/prisma.service'
import { SendReminderDto } from './dto/send-reminder.dto'

@Injectable()
export class ReminderService {
    private readonly ses = new SESv2Client({ region: process.env.AWS_REGION })
    private readonly logger = new Logger(ReminderService.name)

    constructor(private prisma: PrismaService) {}

    /** 期限が近いタスクを取得してメール送信 */
    async sendDeadlines(): Promise<void> {
        // TODO: 閾値は環境変数から取得するようにする
        const threshold = 24 * 60 * 60 * 1000

        /* ユーザーごとにグループ化 */
        const users = await this.prisma.user.findMany({
            where: {
                tasks: {
                    some: {
                        isDone: false,
                        deadline: { lte: new Date(Date.now() + threshold) },
                    },
                },
            },
            include: {
                tasks: {
                    where: {
                        isDone: false,
                        deadline: { lte: new Date(Date.now() + threshold) },
                    },
                },
            },
        })

        for (const u of users) {
            const dto: SendReminderDto = {
                userEmail: u.email,
                tasks: u.tasks.map((t) => ({
                    id: Number(t.id),
                    title: t.title,
                    deadline: t.deadline as Date,
                })),
            }
            await this.sendEmail(dto)
        }
    }

    private async sendEmail(dto: SendReminderDto) {
        const html = `<h3>期限が近いタスク一覧</h3><ul>${dto.tasks
            .map((t) => `<li>${t.title} — ${t.deadline.toLocaleString('ja-JP')}</li>`)
            .join('')}</ul>`

        const transporter = nodemailer.createTransport({
            SES: {
                sesClient: this.ses,
                SendEmailCommand,
            },
        })

        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: dto.userEmail,
            subject: '【Todo】リマインダー',
            html,
        })

        this.logger.log(`Reminder sent to ${dto.userEmail}`)
    }
}
