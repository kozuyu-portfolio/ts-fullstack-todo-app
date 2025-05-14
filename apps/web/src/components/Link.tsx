import { Link as MuiLink, type LinkProps as MuiLinkProps } from '@mui/material'
import { Link as RouterLink, type LinkProps as RouterLinkProps } from '@tanstack/react-router'

type Props = MuiLinkProps & RouterLinkProps

export function Link(props: Props) {
    return <MuiLink component={RouterLink} variant="body2" underline="hover" {...props} />
}
