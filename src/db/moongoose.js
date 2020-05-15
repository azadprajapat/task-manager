
const mongoose =require('mongoose')

mongoose.connect(process.env.MOONGOOSE_CONNECT,{
useNewUrlParser: true,
useCreateIndex: true,
useFindAndModify:true
})
 
 

 