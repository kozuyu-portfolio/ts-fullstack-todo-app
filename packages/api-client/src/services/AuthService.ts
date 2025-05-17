/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SignInRequestDto } from '../models/SignInRequestDto'
import type { SignInResponseDto } from '../models/SignInResponseDto'
import type { SignUpRequestDto } from '../models/SignUpRequestDto'
import type { SignUpResponseDto } from '../models/SignUpResponseDto'
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
export class AuthService {
    /**
     * @returns SignUpResponseDto
     * @throws ApiError
     */
    public static authControllerSignup({
        requestBody,
    }: {
        requestBody: SignUpRequestDto
    }): CancelablePromise<SignUpResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/signup',
            body: requestBody,
            mediaType: 'application/json',
        })
    }
    /**
     * @returns SignInResponseDto
     * @throws ApiError
     */
    public static authControllerSignin({
        requestBody,
    }: {
        requestBody: SignInRequestDto
    }): CancelablePromise<SignInResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/signin',
            body: requestBody,
            mediaType: 'application/json',
        })
    }
}
