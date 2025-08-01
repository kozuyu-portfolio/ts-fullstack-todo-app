import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightIcon from '@mui/icons-material/LightMode'
import { AppBar, type AppBarProps, IconButton, Toolbar, styled } from '@mui/material'
import { useAtom, useSetAtom } from 'jotai'
import { themeModeAtom, toggleThemeAtom } from 'src/store/theme'

interface Props extends AppBarProps {}

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}))

export function Header(props: Props) {
    const { children, ...rest } = props
    const [mode] = useAtom(themeModeAtom)
    const toggle = useSetAtom(toggleThemeAtom)
    return (
        <AppBar position="sticky" color="primary" {...rest}>
            <StyledToolbar sx={{ justifyContent: 'space-between' }}>
                {children}
                <IconButton aria-label="Toggle dark mode" onClick={toggle} edge="end" size="large">
                    {mode === 'light' ? <DarkModeOutlinedIcon style={{ color: 'white' }} /> : <LightIcon />}
                </IconButton>
            </StyledToolbar>
        </AppBar>
    )
}
