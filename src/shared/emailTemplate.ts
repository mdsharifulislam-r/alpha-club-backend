import config from '../config';
import { ICreateAccount, IResetPassword } from '../types/emailTamplate';
const logoImage = 'https://airport-airbnb-website.vercel.app/airbnb-logo.png';

const resetPassWord = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; background: #f6f8fb; margin: 0; padding: 0;">
  <div style="max-width: 470px; margin: 40px auto; background: #ffffff; border-radius: 18px; padding: 38px 28px 34px 28px; box-shadow: 0 8px 26px rgba(20,34,58,0.09); text-align: center;">
    <!-- Title -->
    <h1 style="color: #194376; font-size: 22px; font-weight: 700; margin: 0 0 18px 0; letter-spacing: 0.2px;">
      Verification Code
    </h1>
    <!-- Greeting -->
    <p style="color: #33394d; font-size: 15px; margin: 0 0 22px 0; line-height: 1.6;">
      Hi <strong style="color: #194376;">${values.name.split(' ')[0]}</strong>,
    </p>
    <!-- Message -->
    <p style="color: #4a5874; font-size: 15px; margin: 0 0 28px 0; line-height: 1.7;">
      Please use the verification code below to securely sign in to your account.
    </p>
    <!-- OTP Code Box -->
    <div style="display: inline-block; background: #295ec9; color: #fff; font-size: 28px; font-weight: 700; letter-spacing: 8px; padding: 18px 0; width: 170px; border-radius: 12px; box-shadow: 0 2px 8px rgba(41,94,201,0.11); margin-bottom: 28px;">
      ${values.otp}
    </div>
    <!-- Expiration Note -->
    <p style="font-size: 13px; color: #74839b; margin: 28px 0 0 0;">
      This code will expire in <strong style="color: #194376;">3 minutes</strong>.
    </p>
    <!-- Footer -->
    <p style="font-size: 12px; color: #a8b3c5; margin: 22px 0 0 0; line-height: 1.6;">
      If you didn’t request this code, you can safely ignore this email.<br />
      For security reasons, do not share this code with anyone.
    </p>
  </div>
</body>
</html>
`,
  };
  return data;
};

const verifyAccount = (values: {
  email: string;
  otp: number;
  name: string;
}) => {
  const data = {
    to: values.email,
    subject: 'Verify Your Account',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Account</title>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; background: #f7f8fa; margin: 0; padding: 0;">
  <div style="max-width: 440px; margin: 40px auto; background: #111132; border-radius: 18px; padding: 38px 26px 32px 26px; box-shadow: 0 8px 24px rgba(0,0,0,0.13); text-align: center;">
    <!-- Title -->
    <h1 style="color: #fff; font-size: 22px; font-weight: 700; margin: 0 0 18px 0; letter-spacing: 0.5px;">
      Verify Your Account
    </h1>
    <!-- Greeting -->
    <p style="color: #b3b3d1; font-size: 15px; margin: 0 0 22px 0; line-height: 1.6;">
      Hi <strong style="color: #fff;">${values.name.split(' ')[0]}</strong>,
    </p>
    <!-- Message -->
    <p style="color: #b3b3d1; font-size: 15px; margin: 0 0 30px 0; line-height: 1.6;">
      Thank you for signing up! Please use the verification code below to activate your account.
    </p>
    <!-- OTP Code Box -->
    <div style="display: inline-block; background: #6C2FF9; color: #fff; font-size: 28px; font-weight: 700; letter-spacing: 8px; padding: 18px 0; width: 170px; border-radius: 12px; box-shadow: 0 2px 8px rgba(108,47,249,0.13); margin-bottom: 28px;">
      ${values.otp}
    </div>
    <!-- Expiration Note -->
    <p style="font-size: 13px; color: #9999b3; margin: 28px 0 0 0;">
      This code will expire in <strong style="color: #fff;">3 minutes</strong>.
    </p>
    <!-- Footer -->
    <p style="font-size: 12px; color: #777799; margin: 22px 0 0 0; line-height: 1.6;">
      If you didn’t request this code, you can safely ignore this email.<br />
      For security reasons, do not share this code with anyone.
    </p>
  </div>
</body>
</html>
`,
  };
  return data;
};

const membershipApproved = (values: {
  email: string;
  name: string;
  password: string;
  memberShipId: string;
  phone: string;
}) => {
  const data = {
    to: values.email,
    subject: 'Your Membership Has Been Approved 🎉',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Membership Approved</title>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; background: #f6f8fb; margin: 0; padding: 0;">
  <div style="max-width: 470px; margin: 40px auto; background: #ffffff; border-radius: 18px; padding: 38px 28px 34px 28px; box-shadow: 0 8px 26px rgba(20,34,58,0.09); text-align: center;">
    
    <!-- Title -->
    <h1 style="color: #194376; font-size: 24px; font-weight: 700; margin: 0 0 20px 0;">
      🎉 Membership Approved!
    </h1>

    <!-- Greeting -->
    <p style="color: #33394d; font-size: 15px; margin: 0 0 20px 0; line-height: 1.7;">
      Hi <strong style="color: #194376;">${values.name.split(' ')[0]}</strong>,
    </p>

    <!-- Message -->
    <p style="color: #4a5874; font-size: 15px; margin: 0 0 28px 0; line-height: 1.7;">
      Great news! Your membership application has been approved.<br />
      Your account is now ready to use.
    </p>

    <!-- Membership ID -->
    <div style="background: #f1f5fa; border-radius: 12px; padding: 18px 0 14px 0; margin-bottom: 22px; border: 1px solid #e3eafa;">
      <p style="color: #74839b; font-size: 13px; margin: 0 0 5px 0;">Membership ID</p>
      <p style="color: #295ec9; font-size: 18px; font-weight: 600; margin: 0;">
        ${values.memberShipId}
      </p>
    </div>

    <!-- Login Details -->
    <div style="background: #f1f5fa; border-radius: 12px; padding: 18px 16px; margin-bottom: 22px; border: 1px solid #e3eafa;">
      <p style="color: #74839b; font-size: 13px; margin: 0 0 10px 0;">
        Login Details
      </p>

      <p style="color: #33394d; font-size: 14px; margin: 0 0 8px 0;">
        <strong>Phone Number:</strong> ${values.phone}
      </p>

      <div style="margin-top: 10px;">
        <p style="color: #74839b; font-size: 13px; margin: 0 0 5px 0;">
          Password:
        </p>
        <div style="background: #295ec9; color: #ffffff; font-size: 16px; font-weight: 700; padding: 10px 12px; border-radius: 8px; letter-spacing: 2px; display: inline-block;">
          ${values.password}
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <p style="color: #5071b6; font-size: 14px; margin: 22px 0 0 0; line-height: 1.7;">
      👉 Use your <strong>phone number</strong> and the password above to log in.<br />
      For your security, please change your password after your first login.
    </p>

    <!-- Footer -->
    <p style="font-size: 12px; color: #a8b3c5; margin: 22px 0 0 0; line-height: 1.6;">
      If you need help, feel free to contact our support team.<br />
      <span style="color:#194376;">Welcome — we’re happy to have you with us!</span>
    </p>

  </div>
</body>
</html>
`,
  };

  return data;
};


const membershipRejected = (values: { email: string; name: string }) => {
  const data = {
    to: values.email,
    subject: 'Membership Application Status Update',
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Membership Application Status</title>
</head>

<body style="margin:0; padding:0; background:#f4f6f9; font-family: Inter, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:500px; background:#ffffff; border-radius:16px;
          box-shadow:0 8px 22px rgba(0,0,0,0.08); padding:32px 26px;">

          <!-- Header -->
          <tr>
            <td style="text-align:center;">
              <h2 style="margin:0; font-size:22px; font-weight:700; color:#111827;">
                Membership Application Update
              </h2>
              <p style="margin:8px 0 0; font-size:13px; color:#6b7280;">
                Application Status
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:22px 0;">
              <div style="height:1px; background:#e5e7eb;"></div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td>
              <p style="margin:0 0 14px; font-size:15px; color:#374151;">
                Hi <strong style="color:#111827;">${
                  values.name.split(' ')[0]
                }</strong>,
              </p>

              <p style="margin:0 0 18px; font-size:15px; line-height:1.6; color:#374151;">
                Thank you for your interest in our membership program. We appreciate the time and effort you put into your application.
              </p>

              <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#374151;">
                After careful consideration, we regret to inform you that your membership application has not been approved at this time.
              </p>
            </td>
          </tr>

          <!-- Info Box -->
          <tr>
            <td>
              <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:16px;">
                <p style="margin:0; font-size:14px; line-height:1.6; color:#4b5563;">
                  If you have any questions or would like further clarification, please feel free to contact our support team.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:26px;">
              <p style="margin:0; font-size:13px; line-height:1.6; color:#6b7280; text-align:center;">
                We appreciate your interest and encourage you to apply again in the future.
                <br /><br />
                Kind regards,<br />
                <strong style="color:#111827;">Alpha Support Team</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
  return data;
};


interface IApplicationFormAdminValues {
  userName: string;
  userEmail: string;
  userContact: string;
  userMessage: string;
  adminEmail: string;  // admin email, for admin notification
  membershipType?: string;
}


// Function for sending user's message/info to the admin, includes a button to see all application requests
const applicationFormAdmin = (values: IApplicationFormAdminValues) => {
  const data = {
    to: values.adminEmail,
    subject: `${values.membershipType ? 'New Membership Application Request' : 'New Contract Application Request'}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${values.membershipType ? 'New Membership Application Request' :'New Contract Application Request'}</title>
      </head>
      <body style="font-family: 'Inter', Arial, sans-serif; background: #f6f8fb; margin: 0; padding: 0;">
        <div style="max-width: 490px; margin: 40px auto; background: #ffffff; border-radius: 18px; padding: 38px 28px 34px 28px; box-shadow: 0 8px 26px rgba(20,34,58,0.09);">
          <h1 style="color: #295ec9; font-size: 22px; font-weight: bold; margin: 0 0 18px 0;">
            ${values.membershipType ? 'New Membership Application Request' : 'New Contract Application Request'}
          </h1>
          <p style="font-size:15px; color:#374151; margin-bottom:10px;">
            <strong>Name:</strong> ${values.userName}<br>
            <strong>Email:</strong> ${values.userEmail}<br>
            <strong>Contact:</strong> ${values.userContact}
          </p>
          <div style="margin:18px 0;">
            <p style="margin:0; font-size:14px; color:#111827;">
              <strong>User Message:</strong>
            </p>
            <div style="font-size:14px; color:#374151; background:#f9fafb; border-radius:8px; padding:12px; border:1px solid #e5e7eb; margin-top:5px;">
              ${values.userMessage ? values.userMessage : '<em>No message provided.</em>'}
            </div>
          </div>
          <div style="text-align:center; margin:28px 0 0 0;">
            <a href="${`${config.dashboard_url}/user/contact-from`}" style="display:inline-block; background:#295ec9; color:#fff; font-size:16px; font-weight:600; padding:12px 26px; border-radius:7px; text-decoration:none; letter-spacing:0.5px;">
              View All Application Requests
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  return data;
};
const renewalRequest = (values: { name: string; email: string; phone: string; adminEmail: string; memberShipId?: string; membershipType?: string; userMessage?: string }) => {
  // Directly display membershipType dynamically (no prettify/transform/case handling)
  const displayMembershipType = typeof values.membershipType === 'string' && values.membershipType.trim().length > 0
    ? values.membershipType
    : '';

  const data = {
    to: values.adminEmail,
    subject: 'Membership Renewal Request - Action Required',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Membership Renewal Request</title>
      </head>
      <body style="font-family: 'Inter', Arial, sans-serif; background: #f6f8fb; margin: 0; padding: 0;">
        <div style="max-width: 530px; margin: 40px auto; background: #ffffff; border-radius: 18px; padding: 38px 28px 34px 28px; box-shadow: 0 8px 30px rgba(20,34,58,0.10);">
          <h1 style="color: #295ec9; font-size: 22px; font-weight: bold; margin: 0 0 18px 0;">
            Membership Renewal Request
          </h1>
          <p style="font-size:16px; color:#374151; margin-bottom:18px;">
            Dear Administrator,<br><br>
            This is to notify you that the following member's membership has <b>expired</b> and renewal has been formally requested.
          </p>
          <div style="background: #f1f5fa; border-radius: 12px; padding: 18px 0 14px 0; margin-bottom: 22px; border: 1px solid #e3eafa;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; font-size: 15px; color: #223;">
                <tr>
                  <td style="font-weight:bold; padding:4px 8px 4px 18px; vertical-align:top; color:#74839b;">Membership ID</td>
                  <td style="padding:4px 18px 4px 0; color: #295ec9; font-size: 18px; font-weight: 600;">
                    ${values.memberShipId || '<span style="color:#9ca3af;">Not Provided</span>'}
                  </td>
                </tr>
                ${displayMembershipType ? `
                <tr>
                  <td style="font-weight:bold; padding:4px 8px 4px 18px; vertical-align:top; color:#74839b;">Membership Type</td>
                  <td style="padding:4px 18px 4px 0; color: #295ec9; font-size: 16px; font-weight: 500;">
                    ${displayMembershipType.replace(/(^\w|_\w)/g, match => match.replace('_', ' ').toUpperCase())}
                  </td>
                </tr>
                ` : ''}
            </table>
          </div>
          <div style="margin:20px 0 22px 0; font-size:15px; color:#223;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-weight:bold; padding:4px 8px 4px 0; vertical-align:top;">Name:</td>
                  <td style="padding:4px 0;">${values.name}</td>
                </tr>
                <tr>
                  <td style="font-weight:bold; padding:4px 8px 4px 0; vertical-align:top;">Email:</td>
                  <td style="padding:4px 0;">${values.email}</td>
                </tr>
                <tr>
                  <td style="font-weight:bold; padding:4px 8px 4px 0; vertical-align:top;">Contact:</td>
                  <td style="padding:4px 0;">${values.phone}</td>
                </tr>
            </table>
          </div>
          ${
            values.userMessage
              ? `<div style="margin:20px 0;">
                  <p style="margin:0; font-size:14px; color:#111827;"><strong>User Note:</strong></p>
                  <div style="font-size:14px; color:#374151; background:#f9fafb; border-radius:8px; padding:12px; border:1px solid #e5e7eb; margin-top:5px;">
                    ${values.userMessage}
                  </div>
                </div>`
              : ""
          }
          <div style="margin:28px 0 0 0; text-align:center;">
            <a href="${`${config.dashboard_url}/users`}" style="display:inline-block; background:#295ec9; color:#fff; font-size:16px; font-weight:600; padding:12px 32px; border-radius:7px; text-decoration:none; letter-spacing:0.5px;">
              Review & Process Renewal
            </a>
          </div>
          <p style="margin-top:30px; font-size:13px; color:#9ca3af; text-align:center;">
            This is an automated request for renewal processed by the membership portal. Please review and take the necessary action.
          </p>
        </div>
      </body>
      </html>
    `,
  };
  return data;
};


export const partnerApproved = (values: {
  email: string;
  companyName: string;
  partnerShipId: string;
  contactName: string;
  password: string;
}) => {
  const data = {
    to: values.email,
    subject: 'Your Partnership Has Been Approved 🎉',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Partnership Approved</title>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; background: #f6f8fb; margin: 0; padding: 0;">
  <div style="max-width: 470px; margin: 40px auto; background: #ffffff; border-radius: 18px; padding: 38px 28px 34px 28px; box-shadow: 0 8px 26px rgba(20,34,58,0.09); text-align: center;">

    <!-- Title -->
    <h1 style="color: #194376; font-size: 24px; font-weight: 700; margin: 0 0 20px 0;">
      🎉 Partnership Approved!
    </h1>

    <!-- Greeting -->
    <p style="color: #33394d; font-size: 15px; margin: 0 0 20px 0; line-height: 1.7;">
      Hi <strong style="color: #194376;">${values.contactName.split(' ')[0]}</strong>,
    </p>

    <!-- Message -->
    <p style="color: #4a5874; font-size: 15px; margin: 0 0 24px 0; line-height: 1.7;">
      Great news! Your partnership application for 
      <strong>${values.companyName}</strong> has been approved.
      <br />
      You can now access your partner dashboard and resources.
    </p>

    <!-- Login Credentials -->
    <div style="background: #f1f5fa; border-radius: 12px; padding: 18px; margin-bottom: 22px; border: 1px solid #e3eafa; text-align: left;">
      <p style="color: #74839b; font-size: 13px; margin: 0 0 8px 0;">Login Details</p>
      <p style="margin: 0 0 6px 0; font-size: 14px; color: #333;">
        <strong>Email:</strong> ${values.email}
      </p>
      <p style="margin: 0; font-size: 14px; color: #333;">
        <strong>Password:</strong> ${values.password}
      </p>
    </div>

    <!-- Partner ID -->
    <div style="background: #f1f5fa; border-radius: 12px; padding: 18px 0 14px 0; margin-bottom: 22px; border: 1px solid #e3eafa;">
      <p style="color: #74839b; font-size: 13px; margin: 0 0 5px 0;">Partner ID</p>
      <p style="color: #295ec9; font-size: 18px; font-weight: 600; margin: 0;">
        ${values.partnerShipId}
      </p>
    </div>

    <!-- Footer -->
    <p style="font-size: 14px; color: #5071b6; margin: 22px 0 0 0; line-height: 1.7;">
      👉 Please log in and change your password after your first login for security purposes.
    </p>

    <p style="font-size: 12px; color: #a8b3c5; margin: 22px 0 0 0; line-height: 1.6;">
      If you need help, feel free to contact our support team.<br />
      <span style="color:#194376;">Welcome — we’re happy to have you with us!</span>
    </p>

  </div>
</body>
</html>
`,
  };

  return data;
};



export const partnerRejected = (values: {
  email: string;
  companyName: string;
  contactName: string;
}) => {
  const data = {
    to: values.email,
    subject: 'Your Partnership Application Has Been Rejected ❌',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Partnership Rejected</title>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; background: #f6f8fb; margin: 0; padding: 0;">
  <div style="max-width: 470px; margin: 40px auto; background: #ffffff; border-radius: 18px; padding: 38px 28px 34px 28px; box-shadow: 0 8px 26px rgba(20,34,58,0.09); text-align: center;">

    <!-- Title -->
    <h1 style="color: #c9302c; font-size: 24px; font-weight: 700; margin: 0 0 20px 0;">
      ❌ Partnership Rejected
    </h1>

    <!-- Greeting -->
    <p style="color: #33394d; font-size: 15px; margin: 0 0 20px 0; line-height: 1.7;">
      Hi <strong style="color: #c9302c;">${values.contactName.split(' ')[0]}</strong>,
    </p>

    <!-- Message -->
    <p style="color: #4a5874; font-size: 15px; margin: 0 0 28px 0; line-height: 1.7;">
      We regret to inform you that your partnership application for <strong>${values.companyName}</strong> has been rejected.<br />
      Please feel free to contact our support team if you have any questions or need further clarification.
    </p>

    <!-- Support Note -->
    <p style="font-size: 14px; color: #5071b6; margin: 22px 0 0 0; line-height: 1.7;">
      You can reach out at any time for guidance on reapplying or exploring other opportunities with us.
    </p>

    <!-- Footer -->
    <p style="font-size: 12px; color: #a8b3c5; margin: 22px 0 0 0; line-height: 1.6;">
      Thank you for your interest in partnering with us.<br />
      <span style="color:#194376;">We wish you the best in your future endeavors.</span>
    </p>

  </div>
</body>
</html>
`,
  };

  return data;
};


export const emailTemplate = {
  resetPassWord,
  verifyAccount,
  membershipApproved,
  membershipRejected,
  applicationFormAdmin,
  renewalRequest,
  partnerApproved,
  partnerRejected
};
