import User from "../models/userModels.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "node:crypto";

const login = async(req, res) => {

    const {username, password} = req.body;

    if(!username || !password){
        return res.status(400).json({message: "Please provide valid credentials"});
    }

    try{
        const user = await User.findOne({username});

        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({message: "User not found"});
        }
        
        if(await bcrypt.compare(password, user.password)){
            
            // Generate a cryptographically secure random session token
            let token = crypto.randomBytes(20).toString("hex"); 

            user.token = token;
            await user.save();

            // Return only the token to client — avoids exposing sensitive user data in localStorage
            return res.status(httpStatus.OK).json({token : token});            
        }

    } catch(err) {
        return res.status(500).json({message: "Something went wrong"});
    }
}

const register = async(req, res) => {
    const {username, name, password} =  req.body;

    try{
        const existingUser = await User.findOne({username});

        if(existingUser){
            return res.status(httpStatus.FOUND).json({message: "User already exists"});
        } 

        // Generates a 16-byte Base64 salt, combines it with password, runs hashing 2^10 (1024) times
        // and returns a fixed 60-character string with salt embedded which is then stored in MongoDB
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name, 
            username: username, 
            password: hashedPassword,
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({message: "User registered"});

    } catch(err) {
        res.json({message: `Something went wrong ${err}`});
    }
}

export {login, register};