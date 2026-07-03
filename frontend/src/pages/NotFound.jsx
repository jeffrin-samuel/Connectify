import Button from '@mui/material/Button';

export default function NotFound() {
    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: '#050508',
            color: '#e8e8f0'
        }}>
            <h1 style={{ fontSize: '4rem', color: '#7c5cbf', margin: 0 }}>404</h1>
            <p style={{ color: '#9999bb', fontSize: '1.1rem', margin: '8px 0 24px' }}>
                Oops! The page you're looking for doesn't exist.
            </p>
            <Button 
                variant="contained" 
                onClick={() => {
                    const token = localStorage.getItem("token");
                    window.location.href = token ? "/home" : "/";
                }}
                sx={{ mt: 2 }}
            >
                Go Home
            </Button>
        </div>
    );
}