const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./tasks')
const userSchema = new mongoose.Schema({ 
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens :[{
        token:{
            type: String,
            required: true
        }
    }],
    avatar:{
        type:Buffer
    }
},{timestamps : true})
userSchema.virtual('tasks',{
    ref : 'Task',
    localField :'_id',
    foreignField :'author'

})
userSchema.methods.toJSON=function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject 

}


userSchema.methods.generateToken = async function () {
    const user = this
    const token = await jwt.sign({_id :user._id.toString() },process.env.SECRET_CODE)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('unable to login')
    }
    const ismatch = await bcryptjs.compare(password,user.password)
    if(!ismatch){
        throw new Error('unable to login')
    }
    return user


}
userSchema.pre('save',async function(next){
    const user = this
    
     console.log('password is hashed')
    if(user.isModified('password')){
    user.password = await bcryptjs.hash(user.password,8)
        
    }
    

    next()
})
userSchema.pre('remove', async function (next){
const user =this

await Task.deleteMany({author : user._id})


next()
})

const User = mongoose.model('User', userSchema)

module.exports = User