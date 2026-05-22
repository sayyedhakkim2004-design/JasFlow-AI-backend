import passport from "passport";
import {Strategy as GoogleStrategy } from "passport-google-oauth20";
import {user} from "../db/Mongodb.js";
import dotenv from "dotenv";
dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID:process.env.GOOGLE_CLIENT_ID,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:`${process.env.BACKEND_URL}/api/user/google/callback`
        },

        async(accessToken,refreshToken,profile,done)=>{
            try{

                const email=profile.emails[0].value;
                let isExistingUser=await user.findOne({email});
                if(isExistingUser){
                    if(!isExistingUser.googleId){
                        isExistingUser.googleId=profile.id;
                        isExistingUser.authProvider="google";
                        await isExistingUser.save();
                    }
                }
                else{
                    isExistingUser=await user.create({
                        userName:profile.displayName,
                        email,
                        googleId:profile.id,
                        authProvider:"google",
                        plan:"free",
                        planCount:0
                    });
                   
                }
                return done(null,isExistingUser);

            }
            catch(err){
                return done(err,null)
            }
        }
    )
);
export default passport;