// Shared styles and helpers
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const BRAND_COLOR = '#4f46e5';

// Helper to get branding
const getBranding = (settings) => ({
    name: settings?.siteTitle || 'Wonew Skill Up Academy',
    logo: settings?.logoUrl || '',
    email: settings?.contact?.email || 'support@wonew.in',
    phone: settings?.contact?.phone || '6300369201',
    address: settings?.contact?.address || ''
});

const baseLayout = (content, settings) => {
    const brand = getBranding(settings);
    
    // Logo HTML or Text Fallback
    const headerContent = brand.logo 
        ? `<img src="${brand.logo}" alt="${brand.name}" style="max-height: 50px; max-width: 200px; display: block; margin: 0 auto;">`
        : `<div style="color: white; font-size: 24px; font-weight: bold; letter-spacing: 1px;">${brand.name.toUpperCase()}</div>`;

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; }
  .wrapper { width: 100%; table-layout: fixed; background-color: #f5f5f5; padding-bottom: 40px; }
  .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: sans-serif; color: #171919; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { background-color: ${BRAND_COLOR}; padding: 30px 20px; text-align: center; }
  .content { padding: 40px 30px; }
  .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  .btn { display: inline-block; padding: 14px 30px; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 20px 0; }
  .info-box { background-color: #f3f4f6; border-left: 4px solid ${BRAND_COLOR}; padding: 15px; margin: 20px 0; border-radius: 4px; }
  .feature-list { background-color: #fbfbfb; border: 1px dashed #d1d5db; border-radius: 8px; padding: 20px; margin-top: 20px; }
  .feature-item { margin-bottom: 8px; font-size: 14px; color: #4b5563; }
  @media screen and (max-width: 600px) {
    .content { padding: 20px; }
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
          <p style="margin: 0 0 10px;">${brand.name}</p>
          <p style="margin: 0;">Support: <a href="mailto:${brand.email}" style="color: ${BRAND_COLOR}">${brand.email}</a> ${brand.phone ? `| Phone: ${brand.phone}` : ''}</p>
          ${brand.address ? `<p style="margin: 5px 0 0;">${brand.address}</p>` : ''}
          <p style="margin: 10px 0 0;">&copy; ${new Date().getFullYear()} ${brand.name}. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
`;
};

const studentRegistrationTemplate = (name, email, password, settings = {}) => {
  const brandName = settings?.siteTitle || 'Wonew Skill Up Academy';
  const content = `
    <h1 style="margin: 0 0 20px; color: #111827; font-size: 24px;">Welcome, ${name}! 🎉</h1>
    <p style="margin: 0 0 20px; color: #4b5563; line-height: 1.6;">
      We are thrilled to have you at <strong>${brandName}</strong>. Your student account has been successfully created.
      You now have access to our comprehensive learning platform.
    </p>

    <!-- Credentials -->
    <div class="info-box">
      <p style="margin: 0 0 5px; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: bold;">Login Email</p>
      <p style="margin: 0 0 15px; font-size: 16px; font-family: monospace; color: #111827;">${email}</p>
      
      <p style="margin: 0 0 5px; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: bold;">Temporary Password</p>
      <p style="margin: 0; font-size: 16px; font-family: monospace; color: #111827;">${password}</p>
    </div>

    <!-- CTA -->
    <div style="text-align: center;">
      <a href="${CLIENT_URL}/login" class="btn">Login to Portal</a>
    </div>
    
    <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: -10px; margin-bottom: 30px;">
      Please change your password after your first login.
    </p>

    <!-- Features -->
    <div class="feature-list">
      <p style="margin: 0 0 10px; font-weight: bold; color: #374151;">Your Portal Features:</p>
      <div class="feature-item">⭐ <strong>Student Dashboard:</strong> Track your progress</div>
      <div class="feature-item">⭐ <strong>QR Attendance:</strong> Easy check-ins</div>
      <div class="feature-item">⭐ <strong>Code Playground:</strong> Practice coding live</div>
      <div class="feature-item">⭐ <strong>AI Mock Interview:</strong> Prepare for jobs</div>
      <div class="feature-item">⭐ <strong>Typing Practice:</strong> Improve your speed</div>
    </div>
  `;
  return baseLayout(content, settings);
};

const resetPasswordTemplate = (name, link, settings = {}) => {
  const brandName = settings?.siteTitle || 'Wonew Skill Up Academy';
  const content = `
    <h1 style="margin: 0 0 20px; color: #111827; font-size: 24px;">Password Reset Request 🔒</h1>
    <p style="margin: 0 0 20px; color: #4b5563; line-height: 1.6;">
      Hello ${name}, we received a request to reset your password for your ${brandName} account.
    </p>

    <div style="text-align: center;">
      <a href="${link}" class="btn" style="background-color: #dc2626;">Reset My Password</a>
    </div>

    <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px;">
      This link will expire in <strong>30 minutes</strong>.
    </p>
    
    <p style="margin: 20px 0 0; color: #9ca3af; font-size: 13px; text-align: center;">
      If you didn't request this, you can safely ignore this email.
    </p>
  `;
  return baseLayout(content, settings);
};

// Course Enrollment Template (Bonus)
const courseEnrolledTemplate = (name, course, settings = {}) => {
  const content = `
    <h1 style="margin: 0 0 20px; color: #111827; font-size: 24px;">Enrollment Confirmed! 📚</h1>
    <p style="margin: 0 0 20px; color: #4b5563; line-height: 1.6;">
      Hello ${name}, you have been successfully enrolled in:
    </p>
    
    <div style="background: #e0e7ff; color: #3730a3; padding: 20px; border-radius: 8px; text-align: center; font-weight: bold; font-size: 18px; margin-bottom: 25px;">
      ${course}
    </div>

    <p style="margin: 0 0 20px; color: #4b5563; line-height: 1.6;">
      Visit your dashboard to access course materials and start learning.
    </p>

    <div style="text-align: center;">
      <a href="${CLIENT_URL}/my-courses" class="btn">Go to My Courses</a>
    </div>
  `;
  return baseLayout(content, settings);
};

module.exports = {
  studentRegistrationTemplate,
  resetPasswordTemplate,
  courseEnrolledTemplate
};
