import { AppBar, type AppBarProps, Toolbar, styled } from '@mui/material'

interface Props extends AppBarProps {}

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}))

export function Header(props: Props) {
    const { children, ...rest } = props
    return (
        <AppBar position="sticky" color="primary" {...rest}>
            <StyledToolbar>{children}</StyledToolbar>
        </AppBar>
    )
}
