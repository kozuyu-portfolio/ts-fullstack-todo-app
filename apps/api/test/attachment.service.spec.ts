/// <reference types="vitest" />

import { S3Client } from '@aws-sdk/client-s3'
import { mockClient } from 'aws-sdk-client-mock'
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest'
import { AttachmentService } from '../src/attachment/attachment.service'
import { PrismaService } from '../src/prisma/prisma.service'

const prismaMock = {
    task: {
        findUnique: vi.fn(),
    },
    attachment: {
        create: vi.fn(),
        findUnique: vi.fn(),
    },
} as unknown as PrismaService

const s3ClientMock = mockClient(S3Client) as unknown as S3Client

vi.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: vi.fn(() => 'https://test.com'),
}))

describe('AttachmentService', () => {
    let service: AttachmentService

    beforeEach(() => {
        vi.clearAllMocks()
        service = new AttachmentService(prismaMock, s3ClientMock)
    })

    it('returns presigned url and creates DB record', async () => {
        ;(prismaMock.task.findUnique as Mock).mockResolvedValue({ id: '1', userId: '1' })

        const res = await service.create('1', '1', { filename: 'test.txt' })

        expect(res.url).toBe('https://test.com')
        expect(res.key).toMatch(/\.txt$/)
        expect(prismaMock.attachment.create).toHaveBeenCalled()
    })

    it('getDownloadUrl() returns presigned url', async () => {
        ;(prismaMock.attachment.findUnique as Mock).mockResolvedValue({
            id: 1,
            filename: 'x.txt',
            objectKey: 'test',
            task: { userId: '1' },
        })
        const res = await service.getDownloadUrl('1', '1')
        expect(res.url).toBe('https://test.com')
    })
})
