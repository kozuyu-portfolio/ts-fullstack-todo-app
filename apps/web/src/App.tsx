import { hello } from '@ts-fullstack-todo/shared'

export function App() {
    return (
        <>
            <h1 className="text-2xl font-bold">Full-stack Todo App </h1>
            <h2 className="text-xl font-bold">{hello('World')}</h2>
        </>
    )
}
