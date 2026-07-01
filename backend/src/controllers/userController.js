import User from "../models/userModels.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Meeting from "../models/meetingModel.js";

const JWT_SECRET = process.env.JWT_SECRET;

if(!JWT_SECRET){
  throw new Error("JWT_SECRET is not defined in environment variables");
}


const login = async(req, res) => {

    const {username, password} = req.body;

    if(!username || !password){
        return res.status(400).json({message: "Please provide valid credentials"});
    }

    try{
        const user = await User.findOne({username});

        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({message: "Invalid username or password"});
        }

        let isPasswordCorrect = await bcrypt.compare(password, user.password);
        
        if(isPasswordCorrect){

            user.tokenVersion += 1;  // invalidates all previous tokens for this user
            await user.save();

            // sign a JWT containing userId and username — verifiable without DB lookup
            const token = jwt.sign(
                { userId: user._id, username: user.username, tokenVersion: user.tokenVersion },
                JWT_SECRET,
                { expiresIn: "7d" }
            );

            // Return only the token to client — avoids exposing sensitive user data in localStorage
            return res.status(httpStatus.OK).json({ token : token });            
        }
        else{
            return res.status(httpStatus.UNAUTHORIZED).json({message: "Invalid Username or Password"});
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
            return res.status(httpStatus.FOUND).json({message: "User already exists. Please sign in to continue"});
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

        res.status(httpStatus.CREATED).json({message: "Welcome to Connectify. Please sign in to continue"});

    } catch(err) {
        res.json({message: `Something went wrong ${err}`});
    }
}

// GET /api/users/activities
// protected by authenticate middleware — req.user already set
const getUserHistory = async (req, res) => {
    
  try {
    const meetings = await Meeting.find({ user_id: req.user.userId });
    res.status(httpStatus.OK).json(meetings);
  } catch (err) {
    console.error("Cannot find meeting history", err);
    res.status(500).json({ message: "Error fetching user meeting history" });
  }
};

// POST /api/users/activities
// protected by authenticate middleware — req.user already set
const addToUserHistory = async (req, res) => {
  const { meeting_code } = req.body; // from frontend request body

  try {

    const newMeeting = new Meeting({
      user_id: req.user.userId,  // from JWT payload via middleware
      meetingCode: meeting_code,
    });

    await newMeeting.save();

    res.status(httpStatus.CREATED).json({ 
        message: "Added meeting to history",
        meetingId: newMeeting._id  // returns the specific meeting document's _id
    });
    
  } catch (err) {
    console.error("Failed to save user history", err);
    res.status(500).json({ message: "Error saving user history" });
  }
};

export {login, register, getUserHistory, addToUserHistory};