import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const { email, subject, message, otp } = options;

  // Custom HTML Template
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #000000;
                color: #ffffff;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #0f0f0f;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #333;
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 1px solid #333;
            }
            .header img {
                max-width: 150px;
            }
            .content {
                padding: 30px 20px;
                text-align: center;
            }
            .otp-code {
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 5px;
                color: #a855f7; /* Purple-500 */
                margin: 20px 0;
                background-color: #1a1a1a;
                padding: 15px;
                border-radius: 5px;
                display: inline-block;
            }
            .footer {
                text-align: center;
                color: #666;
                font-size: 12px;
                padding-top: 20px;
                border-top: 1px solid #333;
            }
            .btn {
                display: inline-block;
                padding: 10px 20px;
                background-color: #a855f7;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="color: #ffffff;">Playback Space</h1>
            </div>
            <div class="content">
                <h2 style="color: #ffffff;">Password Reset Request</h2>
                <p style="color: #cccccc;">We received a request to reset your password. Use the following code to verify your identity:</p>
                
                <div class="otp-code">
                    ${otp}
                </div>

                <p style="color: #999999; font-size: 14px;">This code will expire in 10 minutes.</p>
                <p style="color: #999999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Playback Space. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: subject,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
