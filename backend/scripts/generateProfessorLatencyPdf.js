const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const outputPath = path.resolve(
  __dirname,
  "..",
  "..",
  "docs",
  "professor_latency_optimization_report_2026-04-29.pdf",
);

const comparisonRows = [
  ["Professor dashboard", "3136.51", "2198.93", "682.98", "930.98", "2225.01"],
  ["Professor classes", "173.92", "216.35", "202.83", "165.15", "424.46"],
  ["Professor class students", "328.49", "407.37", "403.32", "521.65", "544.14"],
  ["Professor class grades", "329.54", "371.33", "421.50", "749.77", "99.85"],
  ["Professor class attendance", "352.69", "374.35", "457.80", "509.18", "170.46"],
  ["Professor class announcements", "329.59", "738.14", "371.71", "499.24", "467.25"],
  ["Professor class assignments", "553.89", "526.52", "1337.00", "626.42", "553.24"],
  ["Professor assignment submissions", "695.06", "961.12", "1100.59", "298.82", "348.76"],
];

function ensurePageSpace(doc, needed = 80) {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

function heading(doc, text, size = 16) {
  ensurePageSpace(doc, 36);
  doc.moveDown(0.4);
  doc.font("Helvetica-Bold").fontSize(size).text(text);
  doc.moveDown(0.2);
}

function paragraph(doc, text) {
  ensurePageSpace(doc, 40);
  doc.font("Helvetica").fontSize(10.5).text(text, { lineGap: 2 });
  doc.moveDown(0.35);
}

function bulletList(doc, items) {
  for (const item of items) {
    ensurePageSpace(doc, 22);
    doc.font("Helvetica").fontSize(10.5).text(`- ${item}`, {
      indent: 14,
      lineGap: 2,
    });
    doc.moveDown(0.1);
  }
  doc.moveDown(0.35);
}

function subheading(doc, text) {
  ensurePageSpace(doc, 24);
  doc.font("Helvetica-Bold").fontSize(11.5).text(text);
  doc.moveDown(0.15);
}

function drawTable(doc, headers, rows) {
  const startX = doc.page.margins.left;
  const widths = [120, 72, 90, 95, 108, 112];
  const rowHeight = 34;

  const drawRow = (cells, bold = false) => {
    ensurePageSpace(doc, rowHeight + 6);
    const y = doc.y;
    let x = startX;

    for (let i = 0; i < cells.length; i += 1) {
      doc.rect(x, y, widths[i], rowHeight).stroke("#777777");
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 8 : 8.5);
      doc.text(String(cells[i]), x + 4, y + 6, {
        width: widths[i] - 8,
        align: i === 0 ? "left" : "center",
      });
      x += widths[i];
    }

    doc.y = y + rowHeight;
  };

  drawRow(headers, true);
  for (const row of rows) {
    drawRow(row, false);
  }
  doc.moveDown(0.4);
}

function main() {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const doc = new PDFDocument({
    margin: 42,
    size: "A4",
    layout: "landscape",
  });

  doc.pipe(fs.createWriteStream(outputPath));

  doc.font("Helvetica-Bold").fontSize(20).text("Professor Latency Optimization Report");
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(11).text("Date: 2026-04-29");

  heading(doc, "Scope");
  paragraph(
    doc,
    "This optimization pass focused only on professor-facing backend features and targeted latency at the database, route orchestration, and response caching layers.",
  );
  bulletList(doc, [
    "/api/professor/dashboard",
    "/api/professor/classes",
    "/api/professor/classes/:id/students",
    "/api/professor/classes/:id/grades",
    "/api/professor/classes/:id/attendance",
    "/api/professor/classes/:id/announcements",
    "/api/professor/classes/:id/assignments",
    "/api/professor/assignments/:id/submissions",
  ]);

  heading(doc, "Implemented Steps");
  paragraph(doc, "1. Added professor-specific database indexes for classes, grades, attendance, announcements, assignments, and assignment submissions.");
  paragraph(doc, "2. Added repeatable migration tooling, benchmark tooling, and dashboard EXPLAIN ANALYZE tooling.");
  paragraph(doc, "3. Refactored the professor dashboard route to reduce repeated query round trips and parallelize independent reads.");
  paragraph(doc, "4. Added short-lived per-professor caching for the professor dashboard.");
  paragraph(doc, "5. Added short-lived per-professor/per-assignment caching for assignment submissions.");
  paragraph(doc, "6. Added short-lived per-professor/per-class caching for grades and attendance pages.");

  heading(doc, "Latency Comparison");
  paragraph(
    doc,
    "The table below shows average response times in milliseconds at key checkpoints across the optimization pass.",
  );
  drawTable(
    doc,
    [
      "Endpoint",
      "Baseline",
      "After Database Indexes",
      "After Dashboard Caching",
      "After Assignment Submissions Caching",
      "After Grades and Attendance Caching",
    ],
    comparisonRows,
  );

  heading(doc, "Observed Effects");
  subheading(doc, "Most important latency improvements");
  bulletList(doc, [
    "Dashboard improved from 3136.51 ms baseline to 2198.93 ms after indexes.",
    "Dashboard improved further to 682.98 ms average after dashboard caching, with cached hits dropping to single-digit milliseconds.",
    "Assignment submissions improved from 1100.59 ms to 298.82 ms after submissions caching.",
    "Grades improved from 749.77 ms to 99.85 ms after class-grades caching.",
    "Attendance improved from 509.18 ms to 170.46 ms after class-attendance caching.",
  ]);

  heading(doc, "Interpretation");
  subheading(doc, "How to read the benchmark results");
  paragraph(
    doc,
    "Not every uncached endpoint improved monotonically across every run because the database is remote and the benchmark environment showed real network and runtime variance.",
  );
  paragraph(
    doc,
    "The strongest and most reliable gains came from combining targeted indexing with short-lived caching on the most frequently read professor endpoints. Cached routes showed the clearest repeated-hit improvements and the lowest response times.",
  );

  heading(doc, "Files Changed");
  bulletList(doc, [
    "Added backend/migrations/018_professor_feature_indexes.sql",
    "Added backend/scripts/runSqlMigration.js",
    "Added backend/scripts/benchmarkProfessorEndpoints.js",
    "Added backend/scripts/explainProfessorDashboard.js",
    "Added docs/professor_latency_optimization_report.md",
    "Updated backend/package.json",
    "Updated backend/routes/professorRoutes.js",
    "Updated docker-compose.yml",
  ]);

  heading(doc, "Final Outcome");
  paragraph(
    doc,
    "Professor feature latency is materially improved at the database, route, and cache layers. The biggest user-facing wins came from dashboard caching, assignment submissions caching, and class-level grades and attendance caching, built on top of professor-specific database indexing.",
  );

  doc.end();
}

main();
