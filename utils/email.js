const nodemailer = require('nodemailer'); //lesson 136 , 1:07
const bodyParser = require("body-parser"); //npm i body-parser
const sendgridTransport = require("nodemailer-sendgrid-transport") //npm install nodemailer-sendgrid-transport
const pug = require('pug');
// const htmlToText = require('html-to-text')//lesson 206 , 1441 already decrypted
const { convert } = require('html-to-text');

// new Email((user, url).sendWelcome()); lesson 209 , 2:10

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url
        this.from = `Norberto Taguba <${process.env.EMAIL_FROM}>`;
    }

    NewTransport() {
        if(process.env.NODE_ENV === 'production') {
            // Sendgrid
            //JONAS SCHEDMAN VERSION OUTDATED
            // return nodemailer.createTransport({
            //     service: 'SendGrid',
            //     auth: {
            //         user: process.env.SENDGRID_USERNAME,
            //         pass: process.env.SENDGRID_PASSWORD
            //     }
            // })

            //NONOY UPDATED 2025
            return nodemailer.createTransport(sendgridTransport({
            auth:{
                api_key: process.env.SENDGRID_KEY
            },
            }))
        }
        //Mailtrap
        return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    }

     // Send the actual email
    async send(template, subject) {
       // 1) Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        })

        //2) Define the email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            text: convert(html)
            // text: htmlToText.fromString(html) //already decrypted
        }

        // 3) Create a transport and send email
        await this.NewTransport().sendMail(mailOptions)
        }

async sendWelcome() {
  await  this.send('welcome', 'Welcome to the Natours Family!')
    }

async sendPasswordReset() {
    await this.send(
        'passwordReset',
         'Your password reset token (valid for only 10 minutes)'
    );
}
};
