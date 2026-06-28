import { useNavigate } from "react-router-dom"

const withAuth = (WrappedComponent) => {
    
    const AuthComponent = (props) => {
        const navigate = useNavigate();

        // synchronous check BEFORE render — prevents flash of protected UI
        const token = localStorage.getItem("token");
        
        if(!token){
            navigate("/auth");
            return null; // render nothing while redirecting
        }

        // token exists - render protected component normally
        return <WrappedComponent {...props} />
    }

    return AuthComponent;
}

export default withAuth;