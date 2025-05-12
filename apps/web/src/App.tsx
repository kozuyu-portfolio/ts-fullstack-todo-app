import { TodosService } from '@ts-fullstack-todo/api-client'
import { hello } from '@ts-fullstack-todo/shared'

export const fetchTodos = () => TodosService.todoControllerGetTodos()

export function App() {
    return (
        <>
            <h1 className="text-2xl font-bold">Full-stack Todo App </h1>
            <h2 className="text-xl font-bold">{hello('World')}</h2>
        </>
    )
}
