const nodemailer = require('nodemailer');

const pug = require('pug');

const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.fName;
    this.url = url;
    this.from = `El_Warsha<${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //Gmail production
      return nodemailer.createTransport({
        service: 'Gmail',
        secure: true,
        auth: {
          user: process.env.GMAIL_EMAIL_USERNAME,
          pass: process.env.GMAIL_EMAIL_PASSWORD,
        },
      });
    }
    //MAILTRAP development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //1) Render Html based on pug the template
    const html = pug.renderFile(
      `${__dirname}/.././views/email/${template}.pug`,
      {
        fname: this.fName,
        url: this.url,
        subject,
      }
    );

    //2)define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    //3) create transport and send email

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'hwllo  from send wecome');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'your password reset token (valid for only 10 minutes)'
    );
  }
};
