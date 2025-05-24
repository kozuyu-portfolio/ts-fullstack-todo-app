import { PaletteMode, createTheme } from '@mui/material/styles'

export const theme = (mode: PaletteMode) =>
    createTheme({
        palette: {
            mode,
            primary: {
                main: mode === 'light' ? '#0055aa' : '#90caf9',
            },
            secondary: {
                main: mode === 'light' ? '#00695c' : '#80cbc4',
            },
            background: {
                default: mode === 'light' ? '#fafafa' : '#121212',
                paper: mode === 'light' ? '#ffffff' : '#1d1d1d',
            },
            text: {
                primary: mode === 'light' ? '#1b1b1b' : '#e0e0e0',
            },
        },
        /** フォーカスリングを常時可視化（a11y） */
        components: {
            MuiButtonBase: {
                defaultProps: {
                    disableRipple: true,
                },
            },
        },
    })
