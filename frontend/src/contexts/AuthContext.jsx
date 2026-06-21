import { createContext, useContext, useState } from "react";
import axios from 'axios';
import httpStatus from "http-status";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

// Axios auto-throws on 4xx/5xx HTTP errors unlike native fetch (which requires manual res.ok check)
// Error response pre-structured as err.response.data — no manual parsing needed
const client = axios.create({
    baseURL: "http://localhost:8000/api/users"
})

export const AuthProvider = ( {children} ) => {

    const router = useNavigate(); // programmatic navigation hook — must be called inside a functional component

    const authContext = useContext(AuthContext);

    const [userData, setUserData] = useState(authContext);

    const handleRegister = async(name, username, password) => {
        try{
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password,
            });

            if(request.status === httpStatus.CREATED){
                return request.data.message;
            }

        } catch(err) {
            console.error("User register error: ", err);
            throw err;  //err bubbles up to Authentication.jsx (handled in frontend)
        }
    }

    const handleLogin = async(username, password) => {
        try{
            
            let request = await client.post("/login", {
                username: username,
                password: password,
            });

            if(request.status === httpStatus.OK){
                localStorage.setItem("token", request.data.token);
                router("/");   //Redirect user to the home page upon successful login
            }

        } catch(err) {
            console.error("User login error: ", err);
            throw err; //err bubbles up to Authentication.jsx (handled in frontend)
        }
    }

    const data = { userData, setUserData, handleRegister, handleLogin };

    return (
        <AuthContext.Provider value={data}>
            { children }
        </AuthContext.Provider>

    )
}