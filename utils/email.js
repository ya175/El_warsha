const nodemailer = require('nodemailer');
const nodeoutlook = require('nodejs-nodemailer-outlook');
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
      // return nodemailer.createTransport({
      //   service: 'gmail',
      //   auth: {
      //     user: process.env.GMAIL_EMAIL_USERNAME,
      //     pass: process.env.GMAIL_EMAIL_PASSWORD,
      //   },
      // });
      //       Server name: smtp.office365.com
      // Port: 587
      //

      return nodemailer.createTransport({
        // nodeoutlook.createTransport({
        host: 'smtp.office365.com',
        service: 'hotmail',
        port: 587,
        secure: false,
        // Encryption method: STARTTLS
        // secureConnection: false,
        // tls: {
        //   ciphers: 'SSLv3',
        //   rejectUnauthorized: true,
        // },
        // tls: { ciphers: 'SSLv3' },
        // service: 'hotmail',
        auth: {
          user: process.env.OUTLOOK_EMAIL_USERNAME,
          pass: process.env.OUTLOOK_EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2',
        },
      });
    }
    //   return nodemailer.createTransport({

    //     service: 'hotmail',
    //     auth: {
    //       user: process.env.OUTLOOK_EMAIL_USERNAME,
    //       pass: process.env.OUTLOOK_EMAIL_PASSWORD,
    //     },
    //   });
    // }
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
      // from: this.from,
      from: process.env.OUTLOOK_EMAIL_USERNAME,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    //3) create transport and send email

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'hello  from El_Warsha');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'your password reset token (valid for only 10 minutes)'
    );
  }
};
