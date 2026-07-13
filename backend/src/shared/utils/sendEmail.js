const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  if (process.env.NODE_ENV === 'test') {
    return Promise.resolve();
  }
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  };
  return transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  
  const html = `
    <h1>Verify Your Email</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verifyUrl}">Verify Email</a>
  `;
  
  return sendEmail({
    to: email,
    subject: 'NexaFlow - Verify your email',
    html
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  
  const html = `
    <h1>Reset Your Password</h1>
    <p>Please click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you did not request a password reset, please ignore this email.</p>
  `;
  
  return sendEmail({
    to: email,
    subject: 'NexaFlow - Password Reset Request',
    html
  });
};

const sendOrgInviteEmail = async (email, orgName, inviterName, role) => {
  const loginUrl = `${process.env.CLIENT_URL}/login`;
  
  const html = `
    <h1>You have been invited!</h1>
    <p><strong>${inviterName}</strong> has invited you to join the organization <strong>${orgName}</strong> on NexaFlow as a <em>${role}</em>.</p>
    <p>Please log in to your account to accept the invitation and access the organization workspace.</p>
    <a href="${loginUrl}">Log In to NexaFlow</a>
  `;
  
  return sendEmail({
    to: email,
    subject: `Invitation to join ${orgName} on NexaFlow`,
    html
  });
};

const sendTaskAssignedEmail = async (to, { taskTitle, projectName, assignerName, taskLink }) => {
  await sendEmail({
    to,
    subject: `You've been assigned: ${taskTitle}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#0f1117;color:#f1f5f9;padding:32px;border-radius:12px;">
        <h2 style="color:#06b6d4;margin-bottom:8px;">New task assigned</h2>
        <p style="color:#94a3b8;margin-bottom:24px;">${assignerName} assigned you a task in <strong style="color:#f1f5f9">${projectName}</strong></p>
        <div style="background:#161b27;border:1px solid #1e2840;border-radius:8px;padding:16px;margin-bottom:24px;">
          <p style="font-size:16px;font-weight:600;color:#f1f5f9;margin:0">${taskTitle}</p>
        </div>
        <a href="${process.env.CLIENT_URL}${taskLink}" style="display:inline-block;background:#06b6d4;color:#0f1117;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;">
          View task
        </a>
        <p style="color:#475569;font-size:12px;margin-top:24px;">NexaFlow — AI-Powered Workspace</p>
      </div>
    `
  });
};

const sendTaskDueSoonEmail = async (to, { taskTitle, dueDate, taskLink }) => {
  await sendEmail({
    to,
    subject: `Task due soon: ${taskTitle}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#0f1117;color:#f1f5f9;padding:32px;border-radius:12px;">
        <h2 style="color:#f59e0b;margin-bottom:8px;">⏰ Task due soon</h2>
        <p style="color:#94a3b8;margin-bottom:24px;">The following task is due soon:</p>
        <div style="background:#161b27;border:1px solid #1e2840;border-radius:8px;padding:16px;margin-bottom:8px;">
          <p style="font-size:16px;font-weight:600;margin:0">${taskTitle}</p>
          <p style="color:#f59e0b;font-size:13px;margin:8px 0 0">Due: ${new Date(dueDate).toLocaleString()}</p>
        </div>
        <a href="${process.env.CLIENT_URL}${taskLink}" style="display:inline-block;background:#f59e0b;color:#0f1117;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;margin-top:16px;">
          View task
        </a>
      </div>
    `
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrgInviteEmail,
  sendTaskAssignedEmail,
  sendTaskDueSoonEmail
};
