import { Avatar, Box, Button, Container, Link, Stack, TextField, Typography } from '@mui/material'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthService } from '@ts-fullstack-todo/api-client'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/login')({
    component: LoginPage,
})

const loginSchema = z.object({
    email: z.string().min(1, 'メールアドレスは必須です').email('メールアドレスの形式が正しくありません'),
    password: z.string().min(1, 'パスワードは必須です'),
})
type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

    const onSubmit = async (data: LoginForm) => {
        try {
            const res = await AuthService.authControllerSignin({ requestBody: data })
            localStorage.setItem('token', res.access_token)
            navigate({ to: '/tasks' })
        } catch {
            alert('ログインに失敗しました')
        }
    }

    return (
        <Container maxWidth="sm">
            <Box py={8}>
                <Stack alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <LockOpenIcon />
                    </Avatar>
                    <Typography component="h2" variant="h5">
                        ログイン
                    </Typography>
                </Stack>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Stack gap={2}>
                        <TextField
                            label="ID（メールアドレス）"
                            type="email"
                            {...register('email')}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                        />
                        <TextField
                            label="パスワード"
                            type="password"
                            {...register('password')}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                        />
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                            {isSubmitting ? 'Loading…' : 'ログイン'}
                        </Button>
                    </Stack>
                </Box>

                <Typography mt={2} variant="body2" align="center">
                    アカウント未登録の方は{' '}
                    <Link href="/signup" underline="hover">
                        サインアップ
                    </Link>
                </Typography>
            </Box>
        </Container>
    )
}
