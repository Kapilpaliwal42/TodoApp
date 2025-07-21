import jwt from "jsonwebtoken"
import User from "../database/user.js"
const ROLE_LEVELS = {
  user: 0,
  moderator: 1,
  admin: 2,
  superadmin: 3,
  manager: 4
};
const generateToken= (user)=>{
    return jwt.sign({id:user._id, email:user.email},process.env.KEY,{expiresIn:"1d"})
}

export const register = async (req,res)=> {
    const {name,email,password} = req.body
    if(!email||!password||!name){
        return res.status(400).json({message:"Bad request: missing parameters!"})
    }
    try{
        const userExists= await User.findOne({email})
        if(userExists){
            return res.status(409).json({message:"User already exists!!"})
        }else{
            const newuser= await User.create({name,email,password})
            res.status(201).json({ 
                token: generateToken(newuser),
            user:{id:newuser.id,email:newuser.email,role:newuser.role,name:newuser.name}
            })
        }

    }
    catch(err){
        console.error(err);
        res.status(500).json({message:"Internal server error"})
    }

}

 export const login = async(req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return res.status(400).json({message:"Bad request : missing parameters"})
    }
    try{
        const userExists=await User.findOne({email});
        if(!userExists){
            return res.status(400).json({message:"User not found"})
        }

        if(!await userExists.checkPassword(password)){
            return res.status(400).json({message:"Invalid password"})
        }
        res.status(200).json({
            token:generateToken(userExists),
            user:{id:userExists.id,email:userExists.email,role:userExists.role,name:userExists.name}
        })

    }catch(err){
        console.error(err);
        res.status(500).json({message:"Internal server error"})
    }
}

export const Change_Role = async (req,res)=>{
   const {email,newRole} = req.body;
   if(!email || !newRole){
       return res.status(400).json({message:"Bad request : missing parameters"})
   }
   if (!ROLE_LEVELS.hasOwnProperty(newRole)) {
    return res.status(400).json({ message: "Invalid role" });
  }
   try {
    const requester = req.user;
    const requesterLevel = ROLE_LEVELS[requester.role];

    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const targetLevel = ROLE_LEVELS[targetUser.role];
    const newRoleLevel = ROLE_LEVELS[newRole];

    if (targetLevel > requesterLevel) {
      return res.status(403).json({ message: "Cannot modify users above your hierarchy" });
    }

    if (newRoleLevel > requesterLevel) {
      return res.status(403).json({ message: "Cannot assign role higher than your own" });
    }

   

    targetUser.role = newRole;
    await targetUser.save();

    res.status(200).json({ message: `Role changed to ${newRole} for ${email}` });

  } catch (err) {
    console.error("Change role error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
