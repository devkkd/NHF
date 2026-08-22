import nodemailer from "nodemailer";

// ======================================================
// SMTP TRANSPORTER
// ======================================================

const transporter =
  nodemailer.createTransport({
    host:
      process.env.SMTP_HOST,

    port:
      Number(
        process.env.SMTP_PORT || 587
      ),

    secure:
      String(
        process.env.SMTP_SECURE
      ).toLowerCase() ===
      "true",

    auth: {
      user:
        process.env.SMTP_USER,

      pass:
        process.env.SMTP_PASS,
    },

    connectionTimeout:
      15000,

    greetingTimeout:
      15000,

    socketTimeout:
      20000,
  });


// ======================================================
// VERIFY SMTP CONNECTION
// ======================================================

export async function verifySMTP() {
  try {
    await transporter.verify();

    console.log(
      "✅ SMTP connection successful"
    );

    return true;
  } catch (error) {
    console.error(
      "❌ SMTP connection failed"
    );

    console.error(
      "Code:",
      error?.code
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Response:",
      error?.response
    );

    return false;
  }
}


// ======================================================
// SEND MAIL
// ======================================================

const sendMail = async ({
  to,
  subject,
  html,
  text,
}) => {
  if (!to) {
    throw new Error(
      "Recipient email is required."
    );
  }

  if (!subject) {
    throw new Error(
      "Email subject is required."
    );
  }

  if (!html && !text) {
    throw new Error(
      "Email content is required."
    );
  }

  const from =
    process.env.MAIL_FROM ||
    process.env.SMTP_USER;

  try {
    const info =
      await transporter.sendMail({
        from,

        to,

        subject,

        text:
          text ||
          undefined,

        html:
          html ||
          undefined,
      });

    console.log(
      "✅ Email sent successfully"
    );

    console.log(
      "To:",
      to
    );

    console.log(
      "Message ID:",
      info.messageId
    );

    console.log(
      "SMTP response:",
      info.response
    );

    return info;
  } catch (error) {
    console.error(
      "❌ Email sending failed"
    );

    console.error(
      "Code:",
      error?.code
    );

    console.error(
      "Command:",
      error?.command
    );

    console.error(
      "Response:",
      error?.response
    );

    console.error(
      "Message:",
      error?.message
    );

    throw error;
  }
};


// ======================================================
// DEFAULT EXPORT
// ======================================================

export default sendMail;