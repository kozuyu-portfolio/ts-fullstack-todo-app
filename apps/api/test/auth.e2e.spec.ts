import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, Scope, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import request from 'supertest';

let app: INestApplication;
let server: ReturnType<typeof request>;

beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    await app.init();
    server = request(app.getHttpServer());
});

afterAll(async () => {
    await app.close();
});

describe('Auth E2E', () => {
    const dto = { email: 'bob@example.com', password: 'password' };
    let accessToken = '';

    it('POST /auth/signup → 201 & token', async () => {
        const res = await server.post('/auth/signup').send(dto).expect(201);
        expect(res.body).toHaveProperty('access_token');
        accessToken = res.body.access_token;
    });

    it('POST /auth/signin → 200 & token', async () => {
        const res = await server.post('/auth/signin').send(dto).expect(200);
        expect(res.body).toHaveProperty('access_token');
    });

    it('GET /todos (protected) → 200 []', async () => {
        const res = await server
            .get('/todos')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
        expect(res.body).toStrictEqual([]);
    });
});