import mongoose from "mongoose";
import bcrypt from "bcrypt"

 
    const userschema = new mongoose.Schema({
        name : {
            type: String,
            required : true
        },
        email : {
            type:String,
            required: true,
            unique : true
        },
        role : {
            type: String,
            enum:['user','admin','manager','superAdmin', 'moderator'],
            default: 'user'
        },
        password:{
            type:String,
            required:true
        }
    });
   
    userschema.pre('save',async function (next){

        if(!this.isModified('password')) return next()

        this.password= await bcrypt.hash(this.password,10)
        next()
    })
    userschema.methods.checkPassword=async function(password){
        return await bcrypt.compare(password,this.password)
    }

   

const User = mongoose.model("user",userschema)


export default User




