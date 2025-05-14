import { Avatar, Box, Button, Container, Link, Stack, TextField, Typography } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthService } from '@ts-fullstack-todo/api-client'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/signup')({
    component: SignupPage,
})

const signupSchema = z.object({
    email: z.string().min(1, 'メールアドレスは必須です').email('メールアドレスの形式が正しくありません'),
    password: z.string().min(1, 'パスワードは必須です').min(8, 'パスワードは8文字以上である必要があります'),
})
type SignupForm = z.infer<typeof signupSchema>

export function SignupPage() {
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) })

    const onSubmit = async (data: SignupForm) => {
        try {
            const res = await AuthService.authControllerSignup({ requestBody: data })
            localStorage.setItem('token', res.access_token)
            navigate({ to: '/tasks' })
        } catch {
            alert('サインアップに失敗しました')
        }
    }

    return (
        <Container maxWidth="sm">
            <Box py={8}>
                <Stack alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonAddIcon />
                    </Avatar>
                    <Typography component="h2" variant="h5">
                        サインアップ
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
                            {isSubmitting ? 'Loading…' : 'アカウント登録'}
                        </Button>
                    </Stack>
                </Box>

                <Typography mt={2} variant="body2" align="center">
                    アカウントをお持ちの方は{' '}
                    <Link href="/login" underline="hover">
                        ログイン
                    </Link>
                </Typography>
            </Box>
        </Container>
    )
}
