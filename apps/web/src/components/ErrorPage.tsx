import { Box, type BoxProps, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Link } from 'src/components/Link'
interface Props extends BoxProps {
    name: string
    message: string
    stack?: string
}

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    paddingTop: theme.spacing(70),
}))

const isDev = import.meta.env.DEV

export function ErrorPage(props: Props) {
    const { name, message, stack, ...rest } = props
    return (
        <StyledBox {...rest}>
            {isDev && (
                <Typography variant="h1" sx={{ fontWeight: 700, fontSize: '40px', marginBottom: 13 }}>
                    {name}
                </Typography>
            )}
            <Typography sx={{ marginBottom: 8 }}>{message}</Typography>
            {isDev && stack && <Typography sx={{ marginBottom: 8, whiteSpace: 'pre-wrap' }}>{stack}</Typography>}
            <Link to="/">トップページ</Link>
        </StyledBox>
    )
}
