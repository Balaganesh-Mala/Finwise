// Shared styles and helpers
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const BRAND_COLOR = '#1e3a8a'; // Professional Navy Blue for Finance
const ACCENT_COLOR = '#f8fafc';

// Helper to get branding
const getBranding = (settings) => ({
    name: settings?.siteTitle || 'Finwise Career Solutions',
    logo: settings?.logoUrl || '',
    email: settings?.contact?.email || 'info@finwisecareers.com',
    phone: settings?.contact?.phone || '+91-XXXXXXXXXX',
    address: settings?.contact?.address || ''
});

const baseLayout = (content, settings) => {
    const brand = getBranding(settings);
    
    // Logo HTML or Text Fallback with Company Details on Top
    const headerContent = brand.logo 
        ? `<div style="text-align: center;">
             <img src="${brand.logo}" alt="${brand.name}" style="max-height: 60px; max-width: 250px; display: block; margin: 0 auto 10px auto;">
             <div style="color: #bfdbfe; font-size: 14px; font-weight: 500; letter-spacing: 0.5px;">${brand.name}</div>
           </div>`
        : `<div style="text-align: center;">
             <div style="color: white; font-size: 26px; font-weight: 900; letter-spacing: 1.5px; margin-bottom: 5px; text-transform: uppercase;">${brand.name}</div>
             <div style="color: #bfdbfe; font-size: 14px; font-weight: 500; letter-spacing: 0.5px;">Premier Finance & Accounting Institute</div>
           </div>`;

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; }
  .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding-bottom: 40px; padding-top: 20px; }
  .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
  .header { background-color: ${BRAND_COLOR}; padding: 35px 20px; text-align: center; border-bottom: 4px solid #3b82f6; }
  .content { padding: 45px 35px; }
  .footer { background-color: #0f172a; padding: 30px 20px; text-align: center; font-size: 13px; color: #94a3b8; }
  .footer a { color: #38bdf8; text-decoration: none; }
  .btn { display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 25px 0; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: background-color 0.3s; }
  .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 5px solid #2563eb; padding: 20px; margin: 25px 0; border-radius: 6px; }
  .feature-list { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 25px; margin-top: 30px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
  .feature-item { margin-bottom: 12px; font-size: 15px; color: #475569; display: flex; align-items: start; }
  .feature-icon { margin-right: 10px; font-size: 16px; color: #2563eb; }
  @media screen and (max-width: 600px) {
    .content { padding: 25px 20px; }
    .btn { display: block; width: 100%; text-align: center; box-sizing: border-box; }
  }
</style>
</head>
<body>
  <center class="wrapper">
    <table class="main-table" width="100%">
      <!-- Header -->
      <tr>
        <td class="header">
          ${headerContent}
        </td>
      </tr>
      
      <!-- Body -->
      <tr>
        <td class="content">
          ${content}
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td class="footer">
          <p style="margin: 0 0 12px; font-weight: 600; color: #f8fafc; font-size: 15px;">${brand.name}</p>
          <p style="margin: 0 0 8px;">Email: <a href="mailto:${brand.email}">${brand.email}</a> ${brand.phone ? `| Phone: <span style="color: #cbd5e1;">${brand.phone}</span>` : ''}</p>
          ${brand.address ? `<p style="margin: 0 0 12px; color: #cbd5e1;">${brand.address}</p>` : ''}
          <div style="height: 1px; background-color: #334155; margin: 15px 0;"></div>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${brand.name}. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
`;
};

const studentRegistrationTemplate = (name, email, password, settings = {}) => {
  const brandName = settings?.siteTitle || 'Finwise Career Solutions';
  const content = `
    <h1 style="margin: 0 0 20px; color: #0f172a; font-size: 26px; font-weight: 800;">Welcome to ${brandName}!</h1>
    <p style="margin: 0 0 20px; color: #475569; line-height: 1.6; font-size: 16px;">
      Dear <strong>${name}</strong>,<br><br>
      We are delighted to welcome you to our professional learning community. Your student portal access has been successfully provisioned, granting you entry to our premier finance and accounting resources.
    </p>

    <!-- Credentials -->
    <div class="info-box">
      <p style="margin: 0 0 6px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Portal Login Email</p>
      <p style="margin: 0 0 20px; font-size: 18px; color: #0f172a; font-weight: 600;">${email}</p>
      
      <p style="margin: 0 0 6px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Temporary Password</p>
      <p style="margin: 0; font-size: 18px; font-family: 'Courier New', Courier, monospace; color: #0f172a; font-weight: 600; background: #e2e8f0; padding: 4px 8px; border-radius: 4px; display: inline-block;">${password}</p>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-top: 10px;">
      <a href="${CLIENT_URL}/student/login" class="btn">Access Student Portal</a>
    </div>
    
    <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: -5px; margin-bottom: 25px;">
      <em>* For security purposes, please update your password upon first login.</em>
    </p>
  `;
  return baseLayout(content, settings);
};

const resetPasswordTemplate = (name, link, settings = {}) => {
  const brandName = settings?.siteTitle || 'Finwise Career Solutions';
  const content = `
    <h1 style="margin: 0 0 20px; color: #0f172a; font-size: 24px; font-weight: 800;">Password Reset Request</h1>
    <p style="margin: 0 0 25px; color: #475569; line-height: 1.6; font-size: 16px;">
      Dear ${name},<br><br>
      We received a request to reset the password associated with your ${brandName} portal account.
    </p>

    <div style="text-align: center;">
      <a href="${link}" class="btn" style="background-color: #0f172a;">Reset My Password</a>
    </div>

    <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 25px;">
      This secure link will expire in <strong>30 minutes</strong>.
    </p>
    
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 30px; border-radius: 4px;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        If you did not request a password reset, please ignore this email or contact support immediately if you have concerns about your account security.
      </p>
    </div>
  `;
  return baseLayout(content, settings);
};

// Course Enrollment Template
const courseEnrolledTemplate = (name, course, settings = {}) => {
  const brandName = settings?.siteTitle || 'Finwise Career Solutions';
  const content = `
    <h1 style="margin: 0 0 20px; color: #0f172a; font-size: 24px; font-weight: 800;">Enrollment Confirmed</h1>
    <p style="margin: 0 0 20px; color: #475569; line-height: 1.6; font-size: 16px;">
      Dear ${name},<br><br>
      Congratulations! Your enrollment has been successfully processed for the following professional program:
    </p>
    
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 25px; border-radius: 8px; text-align: center; font-weight: 700; font-size: 20px; margin-bottom: 30px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
      ${course}
    </div>

    <p style="margin: 0 0 25px; color: #475569; line-height: 1.6; font-size: 16px;">
      You can now access your comprehensive syllabus, professional resources, and lecture schedules through the student portal.
    </p>

    <div style="text-align: center;">
      <a href="${CLIENT_URL}/my-courses" class="btn">Access the Program</a>
    </div>
  `;
  return baseLayout(content, settings);
};

module.exports = {
  studentRegistrationTemplate,
  resetPasswordTemplate,
  courseEnrolledTemplate
};
