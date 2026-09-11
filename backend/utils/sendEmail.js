import nodemailer from 'nodemailer';

export const sendTaskAssignmentEmail = async ({ employeeEmail, employeeName, taskTitle, priority, description, adminName }) => {
  const subject = `New Task Assigned: ${taskTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Task Assignment Notification</h2>
      <p>Hi <strong>${employeeName}</strong>,</p>
      <p>You have been assigned a new task by <strong>${adminName || 'Admin'}</strong>.</p>
      <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Title:</strong> ${taskTitle}</p>
        <p><strong>Priority:</strong> ${priority}</p>
        <p><strong>Description:</strong> ${description || 'No description provided.'}</p>
      </div>
      <p>Please log in to your account to view details and update task status.</p>
      <br/>
      <p>Regards,<br/>Task Management Team</p>
    </div>
  `;

  await sendEmail({ to: employeeEmail, subject, html, logMessage: `Task email sent to ${employeeEmail}` });
};

export const sendTaskStatusUpdateEmail = async ({ adminEmail, employeeName, taskTitle, oldStatus, newStatus }) => {
  const targetEmail = adminEmail || process.env.ADMIN_EMAIL || 'admin@xplore.com';
  const subject = `Task Status Update: ${taskTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Task Status Update</h2>
      <p>Hi Admin,</p>
      <p><strong>${employeeName}</strong> updated the status of task <strong>${taskTitle}</strong>.</p>
      <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Previous Status:</strong> ${oldStatus || 'N/A'}</p>
        <p><strong>New Status:</strong> <span style="color: #2563eb; font-weight: bold;">${newStatus}</span></p>
      </div>
      <p>Log in to your Admin Dashboard to review changes.</p>
      <br/>
      <p>Regards,<br/>Task Management System</p>
    </div>
  `;

  await sendEmail({ to: targetEmail, subject, html, logMessage: `Status update email sent to ${targetEmail}` });
};

const sendEmail = async ({ to, subject, html, logMessage }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: SMTP_FROM || '"Task Manager" <noreply@xplore.com>',
        to,
        subject,
        html,
      });

      console.log(`[Email Sent] ${logMessage}`);
      return;
    } catch (err) {
      console.warn(`SMTP send failed: ${err.message}. Logging email output instead.`);
    }
  }

  // Console output when SMTP is not configured
  console.log(`--- Email Notification ---`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Log: ${logMessage}`);
  console.log(`--------------------------`);
};
