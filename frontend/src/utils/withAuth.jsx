const withAuth = (WrappedComponent) => {
    
    const AuthComponent = (props) => {

        // synchronous check BEFORE render — prevents flash of protected UI
        const token = localStorage.getItem("token");
        
        if(!token){
            window.location.href = "/auth"; // hard redirect — avoids React render-phase side effect limitation
            return null; // render nothing while redirecting
        }

        // token exists - render protected component normally
        return <WrappedComponent {...props} />
    }

    return AuthComponent;
}

export default withAuth;