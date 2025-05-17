import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ErrorPage } from 'src/components/ErrorPage'
import { Loading } from 'src/components/Loading'

const isDev = import.meta.env.DEV

export const Route = createRootRoute({
    component: () => (
        <>
            <Outlet />
            <TanStackRouterDevtools />
        </>
    ),
    pendingComponent: Loading,
    notFoundComponent: () => <ErrorPage name="404エラー" message="お探しのページは見つかりませんでした" />,
    errorComponent: ({ error }) => (
        <ErrorPage name={error.name} message={isDev ? error.message : 'エラーが発生しました'} stack={error.stack} />
    ),
    wrapInSuspense: true,
})
