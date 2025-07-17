import express from "express";
import { login, register ,Change_Role, getAllUsers } from "../controllers/authController.js"
import { authorization, protect } from "../middlewares/middlewares.js" // Removed isAdmin import as it will be removed/replaced

const router=express.Router();

router.post("/register",register)
router.post("/login",login)
router.get("/myProfile",protect,(req,res)=>{
    res.status(200).json({data:req.user})
})
router.get("/admin",protect,authorization('admin'),(req,res)=>{
    res.status(200).json({message:"admin content"})
})
// Allow 'admin', 'superAdmin', and 'manager' to change roles.
// You can adjust these roles as per your desired hierarchy.
router.put("/changeRole", protect, authorization('admin', 'superAdmin', 'manager'), Change_Role)

// Route to get all users for the admin dashboard
router.get("/users", protect, authorization('admin', 'superAdmin', 'manager'), getAllUsers);

export default router;
