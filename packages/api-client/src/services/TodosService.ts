/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TodoModel } from '../models/TodoModel'
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
export class TodosService {
    /**
     * @returns TodoModel
     * @throws ApiError
     */
    public static todoControllerGetTodos(): CancelablePromise<Array<TodoModel>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/todos',
        })
    }
    /**
     * @returns TodoModel
     * @throws ApiError
     */
    public static todoControllerCreateTodo(): CancelablePromise<TodoModel> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/todos',
        })
    }
}
