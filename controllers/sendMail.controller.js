const asyncWrapper = require("../middlewares/asyncWrapper");
const nodemailer = require("nodemailer");

const sendMail = asyncWrapper(async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Get In Touch" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: "Get In Touch",
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
    });

    res.status(200).json({ message: "Message sent" });
  } catch (err) {
    res.status(500).json({ message: "Error sending message" });
  }
});

module.exports = { sendMail };
