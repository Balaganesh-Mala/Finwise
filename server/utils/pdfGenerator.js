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

      const sectionTitle = (title) => {
        checkPageBreak(60);
        doc
          .fillColor(dark)
          .font("Helvetica-Bold")
          .fontSize(13)
          .text(title, 45, doc.y);
        doc.moveDown(0.6);
      };

      const checkPageBreak = (spaceNeeded = 80) => {
        if (doc.y + spaceNeeded > doc.page.height - 60) {
          doc.addPage();
        }
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
            }
          );
      };

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

      const drawScoreCard = () => {
        sectionTitle("OVERALL PERFORMANCE");

        const boxY = doc.y;
        const verdict =
          data.overallRemark || "No overall remark provided.";

        const verdictHeight = doc.heightOfString(verdict, {
          width: 300,
          align: "left",
        });

        const boxHeight = Math.max(72, verdictHeight + 34);

        doc
          .roundedRect(45, boxY, contentWidth, boxHeight, 8)
          .fillAndStroke(light, border);

        // score
        doc
          .fillColor(primary)
          .font("Helvetica-Bold")
          .fontSize(34)
          .text(`${data.overallScore || 0}`, 65, boxY + 14, {
            continued: true,
          })
          .fillColor(gray)
          .font("Helvetica")
          .fontSize(14)
          .text("/10");

        // verdict
        label("VERDICT", 220, boxY + 16);

        doc
          .fillColor(text)
          .font("Helvetica")
          .fontSize(10)
          .text(verdict, 220, boxY + 30, {
            width: 300,
            align: "left",
          });

        doc.y = boxY + boxHeight + 20;
      };

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

        // left card
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

        // right card
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

          const rowHeight = Math.max(32, remarkHeight + 10, topicHeight + 10);

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

          doc
            .text(`${item.score || 0}/10`, 240, y + 8);

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

      const drawRoadmap = () => {
        if (!data.improvementPlanText) return;

        checkPageBreak(120);

        sectionTitle("IMPROVEMENT ROADMAP");

        doc
          .roundedRect(45, doc.y, contentWidth, 90, 6)
          .fillAndStroke(light, border);

        doc
          .fillColor(text)
          .font("Helvetica")
          .fontSize(10)
          .text(data.improvementPlanText, 58, doc.y + 14, {
            width: contentWidth - 26,
            lineGap: 3,
          });

        doc.moveDown(5);
      };

      /* ---------------- PAGE HEADER ---------------- */

      doc
        .fillColor(primary)
        .font("Helvetica-Bold")
        .fontSize(22)
        .text("FINWISE", 45, 45);

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

      /* ---------------- CONTENT ---------------- */

      drawInfoGrid();
      drawScoreCard();
      drawFeedback();
      drawTopicTable();
      drawRoadmap();

      /* ---------------- FOOTER ALL PAGES ---------------- */

      const pages = doc.bufferedPageRange();

      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        footer();
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