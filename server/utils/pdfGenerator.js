const PDFDocument = require("pdfkit");

exports.generateInterviewPDF = (data, res) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 45,
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
      const border = "#e2e8f0";
      const green = "#16a34a";
      const red = "#dc2626";

      const contentWidth = doc.page.width - 90;

      /* ---------------- HELPERS ---------------- */

      const checkPageBreak = (space = 80) => {
        if (doc.y + space > doc.page.height - 60) {
          doc.addPage();
        }
      };

      const footer = () => {
        doc
          .font("Helvetica")
          .fontSize(7)
          .fillColor(gray)
          .text(
            "This is a computer-generated report based on your mock interview performance evaluated by Finwise Career Solutions.",
            45,
            doc.page.height - 28,
            {
              width: contentWidth,
              align: "center",
              lineBreak: false,
            }
          );
      };

      const sectionTitle = (title) => {
        checkPageBreak(70);

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

      /* ---------------- FOOTER EVERY PAGE ---------------- */

      doc.on("pageAdded", () => {
        footer();
      });

      /* ---------------- HEADER ---------------- */

      doc
        .fillColor(primary)
        .font("Helvetica-Bold")
        .fontSize(20)
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

      doc.moveDown(2.2);

      /* ---------------- INFO GRID ---------------- */

      const drawInfoGrid = () => {
        const startY = doc.y;

        label("CANDIDATE NAME", 45, startY);
        label("INTERVIEW TYPE", 255, startY);

        value(data.studentName, 45, startY + 12, 180);
        value(data.interviewType, 255, startY + 12, 280);

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
          lineGap: 3,
        });

        const boxHeight = Math.max(82, verdictHeight + 34);

        // Outer box
        doc
          .rect(45, boxY, contentWidth, boxHeight)
          .fillAndStroke("#ffffff", border);

        // Left score panel
        doc
          .rect(45, boxY, 145, boxHeight)
          .fill("#f1f5f9");

        // Score
        doc
          .fillColor(primary)
          .font("Helvetica-Bold")
          .fontSize(42)
          .text(`${data.overallScore || 0}`, 58, boxY + 24, {
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
          .text("VERDICT", 210, boxY + 14);

        // Verdict body
        doc
          .fillColor(text)
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(verdict, 210, boxY + 30, {
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
          width: 214,
        });

        const rightHeight = doc.heightOfString(rightText, {
          width: 214,
        });

        const cardHeight = Math.max(leftHeight, rightHeight) + 38;

        // Left
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
          .text(leftText, 58, startY + 28, {
            width: 214,
            lineGap: 2,
          });

        // Right
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
          .text(rightText, 313, startY + 28, {
            width: 214,
            lineGap: 2,
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
            .font("Helvetica")
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
          const topic = item.topic || "N/A";
          const score = item.score || 0;
          const remark = item.remark || "-";

          const topicHeight = doc.heightOfString(topic, {
            width: 160,
          });

          const remarkHeight = doc.heightOfString(remark, {
            width: 220,
          });

          const rowHeight = Math.max(
            32,
            topicHeight + 10,
            remarkHeight + 10
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
            .text(topic, 55, y + 8, {
              width: 160,
            });

          doc.text(`${score}/10`, 240, y + 8);

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

      /* ---------------- FINAL FOOTER ---------------- */

      footer();

      /* ---------------- EVENTS ---------------- */

      doc.on("end", resolve);
      doc.on("error", reject);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};