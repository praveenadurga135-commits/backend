const User = require("../models/User");
const bcryptjs = require("bcryptjs");
const jwt=require("jsonwebtoken");
const { makeToken } = require("../utils/makeToken");
exports.login = async (req,res,next) => {
    try{
        const{ email,password } = req.body;
        if(!email){
            return res.status(401).json({
                message: "Email not found"
            })
        }
        if(!password){
            return res.status(401).json({
                message: "Password not found"
            })
        }
        const user=await User.findOne({email}).select("+password");
        if(!user){
            return res.status(401).json({
                message: "User doesn't exist"
            })
        }
        if(password.length<6){
            return res.status(401).json({
                message: "Password should contain atleast 6 characters"
            })
        }
        const ok=await bcryptjs.compare(password,user.password);
        if(!ok){
            return res.status(401).json({
                message: "Invalid email or password"
            })
        }
        res.status(200).json({
            token: await makeToken(user),
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch(err) {
        next(err);
    }
}
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, confirmpassword } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Name not found"
            });
        }

        if (!email) {
            return res.status(400).json({
                message: "Email not found"
            });
        }

        if (!password || !confirmpassword) {
            return res.status(400).json({
                message: "Enter password and confirm password"
            });
        }

        if (password !== confirmpassword) {
            return res.status(400).json({
                message: "Password and confirm password do not match"
            });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(200).json({
            token: await makeToken(user),
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        next(err);
    }
};