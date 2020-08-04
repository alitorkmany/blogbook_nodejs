const config = require('config');
const nodemailer = require('nodemailer');


// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: "smtp.live.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.get('mailAddress'), // generated ethereal user
      pass: config.get('mailPassword')// generated ethereal password
    }
  });

  module.exports = async function(to, url){
    await transporter.sendMail({
      from: config.get('mailAddress'),
      to: to, // list of receivers
      subject: "Confirm acount", // Subject line
      text: "Confirm your acount", // plain text body
      html: `Please click this email to confirm your email: <a href="${url}">${url}</a>` // html body
    });
  }