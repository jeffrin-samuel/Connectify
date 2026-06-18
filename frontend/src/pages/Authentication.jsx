import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Snackbar } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';

// Dark theme matching Connectify's black & purple aesthetic
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#7c5cbf',         // muted purple accent
        },
        secondary: {
            main: '#9c7de0',         // lighter purple for avatar
        },
        background: {
            paper: '#0d0d14',        // very dark form panel
            default: '#050508',      // near-black app bg
        },
        text: {
            primary: '#e8e8f0',
            secondary: '#9999bb',
        },
    },
});

export default function Authentication() {

    const [username, setUsername] = React.useState('');   
    const [password, setPassword] = React.useState('');   
    const [name, setName] = React.useState('');           
    const [error, setError] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [formState, setFormState] = React.useState(0); // 0 = Login view, 1 = Register view
    const [open, setOpen] = React.useState(false);

    const {handleRegister, handleLogin} = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            if (formState === 0) {
                setError('');        // clear stale errors before retrying login
                setUsername('');     // defensive reset — clears sensitive input before redirect to home pg
                setPassword('');     // defensive reset — clears sensitive input before redirect to home pg
                await handleLogin(username, password);  // authenticates user and redirects to home on success
            }
            if (formState === 1) {
                let registerMessage= await handleRegister(name, username, password); // returns res.data.message as plain string on successful registration
                console.log(registerMessage); 
                setMessage(registerMessage);
                setOpen(true);
                setError('');
                setUsername('');
                setPassword('');
                setFormState(0);   // switch back to Login view after successful registration
            }
        } catch (err) {
            console.error(err);
            // return; // uncomment to short-circuit during API debugging
            
            // AuthContext throws the raw axios error — extract server message via optional chaining
            // falls back to generic message if server response is unavailable (network error etc.)
            let message = err.response?.data?.message || 'Something went wrong';  

            setError(message); // display error below input fields
            setOpen(true);    // trigger Snackbar notification
        }
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />

                <Grid
                    item
                    xs={12}
                    sm={8}
                    md={5}
                    component={Paper}
                    elevation={6}
                    square
                    sx={{
                        backgroundColor: '#0d0d14',   // dark panel matching app theme
                        borderRight: '1px solid #1e1e2e',
                    }}
                >
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>

                        <Typography component="h1" variant="h5" sx={{ mb: 2, color: '#e8e8f0' }}>
                            Connectify
                        </Typography>

                        {/* Sign In / Sign Up toggle */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <Button
                                variant={formState === 0 ? 'contained' : 'outlined'}
                                onClick={() => { setFormState(0); setError(''); }}
                                sx={{ borderRadius: 2 }}
                            >
                                Sign In
                            </Button>
                            <Button
                                variant={formState === 1 ? 'contained' : 'outlined'}
                                onClick={() => { setFormState(1); setError(''); }}
                                sx={{ borderRadius: 2 }}
                            >
                                Sign Up
                            </Button>
                        </Box>

                        <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>

                            {/* Full Name only shown on Sign Up */}
                            {formState === 1 && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Full Name"
                                    value={name}
                                    autoFocus
                                    onChange={(e) => setName(e.target.value)}
                                />
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Username"
                                value={username}
                                autoFocus={formState === 0}   // autoFocus only when Sign In (not both fields)
                                onChange={(e) => setUsername(e.target.value)}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                value={password}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {/* Error message */}
                            {error && (
                                <Typography variant="body2" sx={{ color: '#f44336', mt: 1 }}>
                                    {error}
                                </Typography>
                            )}

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, borderRadius: 2, py: 1.2 }}
                                onClick={handleAuth}
                            >
                                {formState === 0 ? 'Login' : 'Register'}
                            </Button>

                           
                            {formState === 0 ? (
                                <Typography variant="body2" sx={{ textAlign: 'center', mt: 1, color: '#9999bb' }}>
                                    New here?{' '}
                                    <span
                                        onClick={() => setFormState(1)}
                                        style={{ color: '#cbbbee', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Create an account
                                    </span>
                                </Typography>
                            ) : (
                                <Typography variant="body2" sx={{ textAlign: 'center', mt: 1, color: '#9999bb' }}>
                                    Already a user?{' '}
                                    <span
                                        onClick={() => setFormState(0)}
                                        style={{ color: '#cbbbee', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Login
                                    </span>
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Grid>

                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        display: { xs: 'none', sm: 'flex' },  // hide image on mobile (too small), show on tablet and above
                        flexGrow: 1,    // grab all leftover space after the form panel takes its share                          
                        minHeight: '100vh',   // always be as tall as the screen so the panel doesn't collapse to 0px         
                        backgroundImage: "url('/auth-bg.png')",
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />

            </Grid>

            {/* MUI Snackbar — brief popup notification shown at bottom of screen */}
            <Snackbar
                open={open}                      // visible when open state is true
                autoHideDuration={4000}          // auto dismisses after 4 seconds
                onClose={() => setOpen(false)}   // resets open to false on dismiss
                message={message || error}       // displays success message or error
            />
        </ThemeProvider>
    );
}