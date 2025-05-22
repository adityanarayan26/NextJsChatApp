import mongoose from "mongoose";
const { Schema, model, models } = mongoose;


const UserSchema = new Schema({
authId:{
        type:String,
        required:true,
        unique:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },
    username:{
        type:String,
        required:true,

    },
    profileImage:{
        type:String,

    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
},{
    timestamps:true
})

const User = models?.User || model("User",UserSchema)
export default User;