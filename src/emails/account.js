const sgMail=require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const SendWelcome=(email,name)=>{
    sgMail.send({
        from:'azadprajapat4@gmail.com',
        to:email,
        subject:'thanks for joining us',
        Text:`welcome to the app ${name} let me konw how you get along with this app`
        
    
    })

}
module.exports={
    SendWelcome
}