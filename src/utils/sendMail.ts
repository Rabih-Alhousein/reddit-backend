"use strict";
import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
export async function sendMail(to: string, text: string) {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "elmer.greenfelder63@ethereal.email", // generated ethereal user
      pass: "gtECwJsHvH39521BqY", // generated ethereal password
    },
  });
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to, // list of receivers
    subject: "Hello ✔", // Subject line
    text, // plain text body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}
