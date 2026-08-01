export const otpTemplate = (name, otp) => {
  return `
  <div style="font-family:Arial;padding:40px;background:#f5f5f5">

    <div style="max-width:600px;margin:auto;background:white;padding:40px;border-radius:12px">

      <h2 style="margin-bottom:20px">
        NIKITA HOME FURNISHINGS
      </h2>

      <p>Hello ${name},</p>

      <p>
      Your verification code is:
      </p>

      <h1
      style="
      letter-spacing:10px;
      color:#b8860b;
      text-align:center;
      ">
      ${otp}
      </h1>

      <p>
      This OTP is valid for
      <strong>10 minutes.</strong>
      </p>

      <p>
      If you didn't request this email, simply ignore it.
      </p>

      <br>

      <p>
      Regards,
      <br>
      NIKITA HOME FURNISHINGS
      </p>

    </div>

  </div>
  `;
};