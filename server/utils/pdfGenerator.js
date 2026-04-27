const PDFDocument = require("pdfkit");

exports.generateInterviewPDF = (data, res) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 45,
        bufferPages: true,
      });

      /* ---------------- RESPONSE HEADERS ---------------- */
      const fileName = `Interview_Report_${(data.studentName || "Student")
        .replace(/\s+/g, "_")
        .trim()}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      doc.pipe(res);

      /* ---------------- COLORS ---------------- */
      const primary = "#4f46e5";
      const dark = "#0f172a";
      const text = "#334155";
      const gray = "#64748b";
      const light = "#f8fafc";
      const border = "#e2e8f0";
      const green = "#16a34a";
      const red = "#dc2626";

      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - 90;

      /* ---------------- HELPERS ---------------- */

      const checkPageBreak = (spaceNeeded = 80) => {
        if (doc.y + spaceNeeded > doc.page.height - 60) {
          doc.addPage();
        }
      };

      const sectionTitle = (title) => {
        checkPageBreak(60);

        doc
          .fillColor(dark)
          .font("Helvetica-Bold")
          .fontSize(13)
          .text(title, 45, doc.y);

        doc.moveDown(0.6);
      };

      const label = (txt, x, y) => {
        doc
          .fillColor(gray)
          .font("Helvetica-Bold")
          .fontSize(7)
          .text(txt, x, y);
      };

      const value = (txt, x, y, width = 150) => {
        doc
          .fillColor(text)
          .font("Helvetica")
          .fontSize(10)
          .text(txt || "N/A", x, y, { width });
      };

      const footer = () => {
        doc
          .fillColor(gray)
          .font("Helvetica")
          .fontSize(7)
          .text(
            "This is a computer-generated report based on your mock interview performance evaluated by Finwise Career Solutions.",
            45,
            doc.page.height - 28,
            {
              width: contentWidth,
              align: "center",
            }
          );
      };

      /* ---------------- HEADER ---------------- */

      doc
        .fillColor(primary)
        .font("Helvetica-Bold")
        .fontSize(22)
        .text("FINWISE CAREER SOLUTIONS", 45, 45);

      doc
        .fillColor(gray)
        .font("Helvetica")
        .fontSize(9)
        .text(
          `Official Mock Interview Performance Report | ${new Date().toLocaleDateString(
            "en-GB"
          )}`,
          45,
          72
        );

      doc.moveDown(2.3);

      /* ---------------- INFO GRID ---------------- */

      const drawInfoGrid = () => {
        const startY = doc.y;

        // Row 1
        label("CANDIDATE NAME", 45, startY);
        label("INTERVIEW TYPE", 255, startY);

        value(data.studentName, 45, startY + 12, 180);
        value(data.interviewType, 255, startY + 12, 280);

        // Row 2
        const row2 = startY + 38;

        label("TRAINER NAME", 45, row2);
        label("ATTEMPT DATE", 255, row2);
        label("DURATION", 420, row2);

        value(data.trainerName || "Trainer", 45, row2 + 12, 180);
        value(data.interviewDate || "N/A", 255, row2 + 12, 130);
        value(data.duration || "15 Mins", 420, row2 + 12, 100);

        doc.y = row2 + 38;
      };

      /* ---------------- SCORE CARD ---------------- */

      const drawScoreCard = () => {
        sectionTitle("OVERALL PERFORMANCE");

        const boxY = doc.y;

        const verdict =
          data.overallRemark || "No overall remark provided.";

        const verdictHeight = doc.heightOfString(verdict, {
          width: 320,
          lineGap: 2,
        });

        const boxHeight = Math.max(78, verdictHeight + 34);

        // Outer box
        doc
          .rect(45, boxY, contentWidth, boxHeight)
          .fillAndStroke("#ffffff", border);

        // Left score box
        doc
          .rect(45, boxY, 145, boxHeight)
          .fill("#f8fafc");

        // Score
        doc
          .fillColor(primary)
          .font("Helvetica-Bold")
          .fontSize(42)
          .text(`${data.overallScore || 0}`, 58, boxY + 22, {
            continued: true,
          })
          .fillColor("#94a3b8")
          .font("Helvetica")
          .fontSize(16)
          .text("/10");

        // Verdict title
        doc
          .fillColor(gray)
          .font("Helvetica-Bold")
          .fontSize(8)
          .text("VERDICT", 210, boxY + 12);

        // Verdict text
        doc
          .fillColor(text)
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(verdict, 210, boxY + 28, {
            width: 320,
            lineGap: 3,
          });

        doc.y = boxY + boxHeight + 22;
      };

      /* ---------------- FEEDBACK ---------------- */

      const drawFeedback = () => {
        sectionTitle("CRITICAL FEEDBACK");

        const startY = doc.y;

        const leftText = data.strengths || "N/A";
        const rightText = data.weaknesses || "N/A";

        const leftHeight = doc.heightOfString(leftText, {
          width: 215,
        });

        const rightHeight = doc.heightOfString(rightText, {
          width: 215,
        });

        const cardHeight = Math.max(leftHeight, rightHeight) + 35;

        // Left card
        doc
          .roundedRect(45, startY, 240, cardHeight, 6)
          .fillAndStroke("#f0fdf4", border);

        doc
          .fillColor(green)
          .font("Helvetica-Bold")
          .fontSize(8)
          .text("CORE STRENGTHS", 58, startY + 12);

        doc
          .fillColor(text)
          .font("Helvetica")
          .fontSize(10)
          .text(leftText, 58, startY + 26, {
            width: 214,
          });

        // Right card
        doc
          .roundedRect(300, startY, 240, cardHeight, 6)
          .fillAndStroke("#fef2f2", border);

        doc
          .fillColor(red)
          .font("Helvetica-Bold")
          .fontSize(8)
          .text("IMPROVEMENT AREAS", 313, startY + 12);

        doc
          .fillColor(text)
          .font("Helvetica")
          .fontSize(10)
          .text(rightText, 313, startY + 26, {
            width: 214,
          });

        doc.y = startY + cardHeight + 20;
      };

      /* ---------------- TOPIC TABLE ---------------- */

      const drawTopicTable = () => {
        sectionTitle("SUBJECT PROFICIENCY BREAKDOWN");

        const topics =
          data.topicScores?.length
            ? data.topicScores
            : data.topics || [];

        if (!topics.length) {
          doc
            .fillColor(text)
            .fontSize(10)
            .text("No topic data available.");
          doc.moveDown(1);
          return;
        }

        let y = doc.y;

        const drawHeader = () => {
          doc
            .rect(45, y, contentWidth, 24)
            .fillAndStroke("#eef2ff", border);

          doc
            .fillColor(dark)
            .font("Helvetica-Bold")
            .fontSize(8)
            .text("TOPIC", 55, y + 8)
            .text("SCORE", 240, y + 8)
            .text("REMARK / SUGGESTION", 305, y + 8);

          y += 24;
        };

        drawHeader();

        topics.forEach((item) => {
          const remark = item.remark || "-";

          const remarkHeight = doc.heightOfString(remark, {
            width: 220,
          });

          const topicHeight = doc.heightOfString(
            item.topic || "N/A",
            {
              width: 160,
            }
          );

          const rowHeight = Math.max(
            32,
            remarkHeight + 10,
            topicHeight + 10
          );

          if (y + rowHeight > doc.page.height - 55) {
            doc.addPage();
            y = 45;
            drawHeader();
          }

          doc.rect(45, y, contentWidth, rowHeight).stroke(border);

          doc
            .fillColor(text)
            .font("Helvetica")
            .fontSize(10)
            .text(item.topic || "N/A", 55, y + 8, {
              width: 160,
            });

          doc.text(`${item.score || 0}/10`, 240, y + 8);

          doc
            .fillColor(gray)
            .fontSize(9)
            .text(remark, 305, y + 8, {
              width: 220,
            });

          y += rowHeight;
        });

        doc.y = y + 18;
      };

      /* ---------------- ROADMAP ---------------- */

      const drawRoadmap = () => {
        if (!data.improvementPlanText) return;

        checkPageBreak(140);

        sectionTitle("IMPROVEMENT ROADMAP");

        doc
          .fillColor(text)
          .font("Helvetica")
          .fontSize(10)
          .text(data.improvementPlanText, 45, doc.y + 5, {
            width: contentWidth,
            lineGap: 4,
            align: "left",
          });

        doc.moveDown(2);
      };

      /* ---------------- DRAW CONTENT ---------------- */

      drawInfoGrid();
      drawScoreCard();
      drawFeedback();
      drawTopicTable();
      drawRoadmap();

      /* ---------------- FOOTER ON ALL PAGES ---------------- */

      const range = doc.bufferedPageRange();

for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);

  const oldY = doc.y; // save current cursor position

  doc
    .fillColor(gray)
    .font("Helvetica")
    .fontSize(7)
    .text(
      "This is a computer-generated report based on your mock interview performance evaluated by Finwise Career Solutions.",
      45,
      doc.page.height - 28,
      {
        width: contentWidth,
        align: "center",
        lineBreak: false
      }
    );

  doc.y = oldY; // restore cursor position
}

      /* ---------------- EVENTS ---------------- */

      doc.on("end", resolve);
      doc.on("error", reject);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

exports.generateTrainerReportPDF = (studentsData, res) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 30,
        bufferPages: true,
      });

      const fileName = `Trainer_Mock_Interview_Report.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      doc.pipe(res);

      /* ---------------- COLORS ---------------- */
      const primary = "#4f46e5";
      const dark = "#0f172a";
      const text = "#334155";
      const gray = "#64748b";
      const border = "#e2e8f0";
      const green = "#16a34a";
      const red = "#dc2626";

      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - 60;

      /* ---------------- HEADER ---------------- */
      doc
        .fillColor(primary)
        .font("Helvetica-Bold")
        .fontSize(20)
        .text("FINWISE CAREER SOLUTIONS", 30, 30);

      doc
        .fillColor(gray)
        .font("Helvetica")
        .fontSize(9)
        .text(
          `Trainer Mock Interview Report | Generated on: ${new Date().toLocaleDateString("en-GB")}`,
          30,
          54
        );

      doc.moveDown(2);

      /* ---------------- TABLE ---------------- */
      // Landscape columns width distribution
      const colLines = [30, 160, 230, 280, 380, 580, 30 + contentWidth];

      const drawHeader = (yPos) => {
        doc.rect(30, yPos, contentWidth, 24).fillAndStroke("#eef2ff", border);

        doc
          .fillColor(dark)
          .font("Helvetica-Bold")
          .fontSize(8)
          .text("STUDENT", 35, yPos + 8)
          .text("DATE", 165, yPos + 8)
          .text("SCORE", 235, yPos + 8)
          .text("STATUS", 285, yPos + 8)
          .text("WEAKNESSES", 385, yPos + 8)
          .text("OVERALL REMARK", 585, yPos + 8);

        // Draw vertical lines for header
        colLines.forEach(x => {
            doc.moveTo(x, yPos).lineTo(x, yPos + 24).stroke(border);
        });

        return yPos + 24;
      };

      let y = drawHeader(doc.y);

      if (!studentsData || studentsData.length === 0) {
        doc
          .fillColor(text)
          .font("Helvetica")
          .fontSize(10)
          .text("No data available for the selected filters.", 35, y + 15);
      } else {
        studentsData.forEach((item) => {
          const name = item.studentId ? item.studentId.name : "N/A";
          const dateStr = item.interviewDate ? new Date(item.interviewDate).toLocaleDateString("en-GB") : new Date(item.createdAt).toLocaleDateString("en-GB");
          const score = `${item.overallScore || 0}/10`;
          const status = item.status || item.performanceStatus || "N/A";
          const weaknesses = item.weaknesses || "None recorded";
          const remark = item.overallRemark || "No remark";

          // Calculate max height for this row
          const h1 = doc.heightOfString(name, { width: 120, fontSize: 8 });
          const h2 = doc.heightOfString(weaknesses, { width: 190, fontSize: 8 });
          const h3 = doc.heightOfString(remark, { width: 190, fontSize: 8 });

          const rowHeight = Math.max(24, h1 + 10, h2 + 10, h3 + 10);

          // Landscape height is shorter (approx 595 - margin = ~555)
          if (y + rowHeight > doc.page.height - 40) {
            doc.addPage();
            y = 30;
            y = drawHeader(y);
          }

          // Background Highlight for Critical Risk / Needs Improvement
          const isPoor = status === "Needs Improvement" || status === "Critical Risk";
          const bgColor = isPoor ? "#fef2f2" : "#ffffff";
          
          doc.rect(30, y, contentWidth, rowHeight).fillAndStroke(bgColor, border);

          doc
            .fillColor(dark)
            .font("Helvetica-Bold")
            .fontSize(8)
            .text(name, 35, y + 8, { width: 120 });

          doc
            .fillColor(gray)
            .font("Helvetica")
            .fontSize(8)
            .text(dateStr, 165, y + 8, { width: 60 });

          doc
            .fillColor(primary)
            .font("Helvetica-Bold")
            .text(score, 235, y + 8, { width: 40 });

          // Status Color
          let statusColor = dark;
          if (status === "Job Ready" || status === "Highly Capable") statusColor = green;
          if (isPoor) statusColor = red;

          doc
            .fillColor(statusColor)
            .font("Helvetica-Bold")
            .text(status, 285, y + 8, { width: 90 });

          doc
            .fillColor(text)
            .font("Helvetica")
            .text(weaknesses, 385, y + 8, { width: 190 });

          doc
            .fillColor(gray)
            .text(remark, 585, y + 8, { width: 190 });

          // Draw vertical lines for row
          colLines.forEach(x => {
              doc.moveTo(x, y).lineTo(x, y + rowHeight).stroke(border);
          });

          y += rowHeight;
        });
      }

      /* ---------------- FOOTER ON ALL PAGES ---------------- */
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        const oldY = doc.y;
        doc
          .fillColor(gray)
          .font("Helvetica")
          .fontSize(7)
          .text(
            "Finwise Career Solutions - Trainer Report",
            30,
            doc.page.height - 20,
            {
              width: contentWidth,
              align: "center",
              lineBreak: false
            }
          );
        doc.y = oldY;
      }

      doc.on("end", resolve);
      doc.on("error", reject);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};