const generateFeeReminderTemplate = (studentName, amount, dueDate, installmentNo) => {
    const formattedAmount = amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
    const formattedDate = new Date(dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fee Reminder</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; color: #374151; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
            .header { background-color: #2563eb; color: #ffffff; padding: 30px 40px; text-align: center; }
            .header img { max-width: 150px; margin-bottom: 15px; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
            .content { padding: 40px; }
            .content p { font-size: 16px; margin-bottom: 20px; }
            .highlight-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center; }
            .highlight-box h2 { margin: 0; font-size: 32px; color: #1e40af; }
            .highlight-box p { margin: 5px 0 0; color: #64748b; font-size: 14px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px; }
            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .details-table th, .details-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f1f5f9; }
            .details-table th { color: #64748b; font-weight: 600; width: 40%; font-size: 14px; }
            .details-table td { font-weight: 500; font-size: 15px; }
            .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center; font-size: 13px; color: #94a3b8; }
            .footer p { margin: 5px 0; }
            .action-button { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <!-- Using a text logo since asset URL isn't guaranteed, but creating space for one -->
                <h2 style="font-size: 28px; font-weight: 800; margin:0; letter-spacing: 1px;">FINWISE</h2>
                <div style="height: 10px;"></div>
                <h1>Payment Reminder</h1>
            </div>
            
            <div class="content">
                <p>Dear <strong>${studentName}</strong>,</p>
                <p>This is a friendly reminder that your upcoming fee installment is due soon. Please ensure payment is made by the due date to avoid any late fees.</p>
                
                <div class="highlight-box">
                    <h2>${formattedAmount}</h2>
                    <p>Amount Due</p>
                </div>
                
                <table class="details-table">
                    <tr>
                        <th>Installment Info</th>
                        <td>Installment #${installmentNo}</td>
                    </tr>
                    <tr>
                        <th>Due Date</th>
                        <td style="color: #e11d48; font-weight: 600;">${formattedDate}</td>
                    </tr>
                    <tr>
                        <th>Status</th>
                        <td><span style="background-color: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">PENDING</span></td>
                    </tr>
                </table>
                
                <p>If you have already made the payment, please ignore this email or contact our administration regarding the update.</p>
                
                <p style="text-align: center; margin-top: 30px;">
                    <a href="#" class="action-button">Pay Now</a>
                </p>
            </div>
            
            <div class="footer">
                <p><strong>Finwise Education</strong></p>
                <p>123 Education Lane, Learning District, City</p>
                <p>contact@finwise.edu | +91 98765 43210</p>
                <p style="margin-top: 15px; font-size: 11px;">This is an automated email. Please do not reply directly to this message.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    generateFeeReminderTemplate
};
