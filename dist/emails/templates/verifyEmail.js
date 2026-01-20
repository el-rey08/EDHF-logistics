"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailOTPTemplate = void 0;
const verifyEmailOTPTemplate = ({ userName, appName, otpCode, expiryTime, supportEmail, currentYear, }) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Email Verification</title>

<style>
  body {
    margin: 0;
    padding: 0;
    background-color: #f4f6f8;
    font-family: Arial, Helvetica, sans-serif;
  }
  .container {
    max-width: 600px;
    margin: auto;
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
  }
  .header {
    background: #0f172a;
    color: #ffffff;
    text-align: center;
    padding: 24px;
  }
  .content {
    padding: 32px;
    color: #333;
    font-size: 16px;
    line-height: 1.6;
  }
  .otp {
    background: #f1f5f9;
    text-align: center;
    padding: 16px;
    font-size: 28px;
    letter-spacing: 6px;
    font-weight: bold;
    border-radius: 6px;
    margin: 24px 0;
  }
  .footer {
    padding: 20px;
    text-align: center;
    font-size: 13px;
    color: #6b7280;
    background: #f8fafc;
  }

  @media (max-width: 600px) {
    .content {
      padding: 20px;
      font-size: 15px;
    }
    .otp {
      font-size: 24px;
      letter-spacing: 4px;
    }
  }
</style>
</head>

<body>
  <div class="container">
    <div class="header">
      <h1>${appName}</h1>
    </div>

    <div class="content">
      <p>Hello ${userName},</p>

      <p>
        Use the OTP below to verify your email address:
      </p>

      <div class="otp">${otpCode}</div>

      <p>
        This code expires in <strong>${expiryTime}</strong>.
        Do not share it with anyone.
      </p>

      <p>
        Need help? Contact
        <a href="mailto:${supportEmail}">${supportEmail}</a>
      </p>
    </div>

    <div class="footer">
      © ${currentYear} ${appName}. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
};
exports.verifyEmailOTPTemplate = verifyEmailOTPTemplate;
//# sourceMappingURL=verifyEmail.js.map