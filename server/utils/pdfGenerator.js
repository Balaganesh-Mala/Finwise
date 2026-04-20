const PDFDocument = require('pdfkit');

exports.generateInterviewPDF = (data, res) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });

            // Ensure the res correctly pipes the document output
            doc.pipe(res);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Interview_Report_${data.studentName.replace(/\\s+/g, '_')}.pdf"`);

            // Custom Colors
            const colorPrimary = '#4f46e5'; // Indigo-600
            const colorSecondary = '#475569'; // Slate-600
            const colorDark = '#1e293b'; // Slate-800
            const colorLightGray = '#f8fafc';
            const colorBorder = '#e2e8f0';
            const colorGreen = '#10b981';
            const colorRed = '#ef4444';

            // --- Header Section ---
            doc.fillColor(colorPrimary)
               .fontSize(24)
               .font('Helvetica-Bold')
               .text('FINWISE CAREER SOLUTIONS', { align: 'left' });

            doc.fillColor('gray')
               .fontSize(10)
               .font('Helvetica')
               .text(`Official Mock Interview Performance Report | ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`)
               .moveDown(2);

            // --- Candidate Info Table ---
            const startYTable1 = doc.y;
            
            // Labels
            doc.fillColor('gray').fontSize(8).font('Helvetica-Bold')
               .text('CANDIDATE NAME', 50, startYTable1)
               .text('INTERVIEW TYPE', 230, startYTable1)
               .text('ATTEMPT DATE', 380, startYTable1);

            // Values
            doc.fillColor(colorSecondary).fontSize(10).font('Helvetica')
               .text(data.studentName || 'Student', 50, startYTable1 + 12)
               .text(data.interviewType || 'N/A', 230, startYTable1 + 12)
               .text(data.interviewDate, 380, startYTable1 + 12);

            doc.moveDown(2);

            // --- Score Section ---
            const startYScore = doc.y + 20;
            doc.fillColor(colorDark).fontSize(14).font('Helvetica-Bold')
               .text('OVERALL PERFORMANCE', 50, startYScore);
            
            doc.moveDown(1);
            const boxY = doc.y;

            // Draw Box
            doc.rect(50, boxY, 495, 60).fillAndStroke(colorLightGray, colorBorder);

            // Score Text
            doc.fillColor(colorPrimary).fontSize(40).font('Helvetica-Bold')
               .text(data.overallScore || '0', 70, boxY + 10, { continued: true })
               .fillColor('gray').fontSize(14).font('Helvetica').text('/10');

            // Verdict Label
            doc.fillColor('gray').fontSize(8).font('Helvetica-Bold')
               .text('VERDICT', 200, boxY + 15);
            
            // Verdict Value
            doc.fillColor(colorSecondary).fontSize(10).font('Helvetica')
               .text(data.overallRemark || 'No remark provided.', 200, boxY + 30, { width: 330 });

            doc.moveDown(4);

            // --- Strengths & Improvement Section ---
            doc.fillColor(colorDark).fontSize(14).font('Helvetica-Bold')
               .text('CRITICAL FEEDBACK', 50, doc.y);
            
            doc.moveDown(1);
            const feedbackY = doc.y;

            // Strengths
            doc.fillColor(colorGreen).fontSize(8).font('Helvetica-Bold').text('CORE STRENGTHS', 50, feedbackY);
            doc.fillColor(colorSecondary).fontSize(10).font('Helvetica')
               .text(data.strengths || 'N/A', 50, doc.y + 5, { width: 235 });

            // Weaknesses
            const weaknessY = Math.max(doc.y, feedbackY);
            doc.fillColor(colorRed).fontSize(8).font('Helvetica-Bold').text('IMPROVEMENT AREAS', 300, feedbackY);
            doc.fillColor(colorSecondary).fontSize(10).font('Helvetica')
               .text(data.weaknesses || 'N/A', 300, doc.y + 5, { width: 235 });

            let nextY = Math.max(doc.y, weaknessY) + 30;

            // --- Subject Proficiency Table ---
            if (nextY > 700) { doc.addPage(); nextY = 50; }
            doc.y = nextY;
            doc.fillColor(colorDark).fontSize(14).font('Helvetica-Bold')
               .text('SUBJECT PROFICIENCY BREAKDOWN', 50, nextY);
            
            doc.moveDown(1);

            const topics = (data.topicScores && data.topicScores.length) ? data.topicScores : (data.topics || []);
            
            if (topics.length > 0) {
                // Table Header
                let tableY = doc.y;
                doc.rect(50, tableY, 495, 25).fillAndStroke('#f1f5f9', colorBorder);
                
                doc.fillColor(colorDark).fontSize(8).font('Helvetica-Bold')
                   .text('TOPIC', 60, tableY + 8)
                   .text('SCORE', 210, tableY + 8)
                   .text('REMARK / SUGGESTION', 280, tableY + 8);
                
                tableY += 25;
                
                // Table Rows
                topics.forEach((topic) => {
                    // Check if new page is needed
                    if (tableY > 750) {
                        doc.addPage();
                        tableY = 50;
                        doc.rect(50, tableY, 495, 25).fillAndStroke('#f1f5f9', colorBorder);
                        doc.fillColor(colorDark).fontSize(8).font('Helvetica-Bold')
                           .text('TOPIC', 60, tableY + 8)
                           .text('SCORE', 210, tableY + 8)
                           .text('REMARK / SUGGESTION', 280, tableY + 8);
                        tableY += 25;
                    }

                    const rowHeight = 30;
                    doc.rect(50, tableY, 495, rowHeight).stroke(colorBorder);
                    
                    doc.fillColor(colorSecondary).fontSize(10).font('Helvetica')
                       .text(topic.topic || 'N/A', 60, tableY + 8, { width: 140, height: rowHeight - 16, ellipsis: true })
                       .text(`${topic.score || 0}/10`, 210, tableY + 8)
                       .fillColor('gray').fontSize(8).font('Helvetica-Oblique')
                       .text(topic.remark || '-', 280, tableY + 8, { width: 250, height: rowHeight - 16, ellipsis: true });
                       
                    tableY += rowHeight;
                });
                
                doc.y = tableY + 20;
            } else {
                doc.fillColor(colorSecondary).fontSize(10).font('Helvetica')
                   .text('No topic data recorded.', 50, doc.y);
                doc.moveDown(2);
            }

            // --- Roadmap Section ---
            if (data.improvementPlanText) {
                if (doc.y > 650) doc.addPage();
                doc.moveDown(1);
                doc.fillColor(colorDark).fontSize(14).font('Helvetica-Bold')
                   .text('IMPROVEMENT ROADMAP', 50, doc.y);
                
                doc.moveDown(1);
                doc.fillColor(colorSecondary).fontSize(10).font('Helvetica')
                   .text(data.improvementPlanText, 50, doc.y);
            }

            // --- Footer ---
            // Draw footer on all pages
            const pages = doc.bufferedPageRange();
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);
                
                // Add footer
                doc.fillColor('gray').fontSize(7).font('Helvetica')
                   .text('This is a computer-generated report based on your mock interview performance evaluated by our expert trainers at Finwise Career Solutions. For any queries, reach out to info@finwisecareers.com', 
                         50, 
                         doc.page.height - 35, 
                         { align: 'center', width: doc.page.width - 100, lineBreak: false });
            }

            doc.end();

            doc.on('end', () => {
                resolve();
            });

            doc.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};
