const express = require('express')
const User = require('../models/users')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const {SendWelcome}=require('../emails/account')
const sharp = require('sharp')
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        SendWelcome(user.email,user.name)
        const token = await user.generateToken()
        res.status(201).send({user,token})
    } catch (e) {
        res.status(400).send(e)
    }
})
 router.post('/users/login', async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
      
        const token = await user.generateToken()
        
        res.send({user , token})
    }catch(e){
        res.status(403).send()
    }
})
router.post('/users/logout',auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token !==req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()

    }
})
router.post('/users/logoutall',auth,async(req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})
router.get('/users/me',auth, async (req, res) => {
    res.send(req.user)
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/me',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = req.user
        updates.forEach((update)=>user[update]=req.body[update])
        await user.save()
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me',auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id)

        // if (!user) {
        //     return res.status(404).send()
        // }
        await req.user.remove()
         res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})


const upload = multer({

    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)/)){
            return cb(new Error('please upload a valid image file'))
        }
        cb(undefined,true)

    }
})
router.delete('/users/me/avatar',auth, async (req,res)=>{
if(!req.user.avatar){
   return res.status(400).send('no avatar exists')
}
 req.user.avatar=undefined
await req.user.save()
res.send()
    
})
router.get('/users/:id/avatar',async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user||!user.avatar){
            throw new Error()
        }
        res.set('Content-type','image/png')
        res.send(user.avatar)

    }catch(e){
        res.status(404).send()
    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).png().resize({width:100,height:100 }).toBuffer()
    
     req.user.avatar= buffer    
   await req.user.save()
   res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

module.exports = router