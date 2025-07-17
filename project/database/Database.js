import mongoose from "mongoose";

 

  async function DB_connect(){
    try{
       await mongoose.connect(process.env.DATABASE)
        console.log("database connection successful!!");
    }catch(error){
            console.log(`Error: something went wrong ${error}`);
            
    }
 }

export default DB_connect