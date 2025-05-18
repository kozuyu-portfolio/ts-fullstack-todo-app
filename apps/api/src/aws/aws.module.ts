import { S3Client } from '@aws-sdk/client-s3'
import { Module } from '@nestjs/common'

@Module({
    providers: [
        {
            provide: S3Client,
            useFactory: () => new S3Client(),
        },
    ],
    exports: [S3Client],
})
export class AWSModule {}
