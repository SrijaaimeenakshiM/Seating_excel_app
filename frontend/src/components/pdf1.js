import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "./CIT_logo.png";

const hallOrder = [
  "T1", "T2", "T3", "T4", "T6", "T7", "T8", "T9", "T10", "T11A", "T11B",
  "T12", "T13", "T14", "T15", "T16", "T17", "T18", "T20", "T21",
  "MT1", "MT2", "MT3", "MT4", "MT5", "MT6", "MT7", "MT8",
  "MS1", "MS2", "MS3", "MS4", "MS5", "MS6", "MS7", "MS8",
  "S2", "S3", "S4", "S5", "S6", "S7", "Phy Lab"
];

const MAX_ROWS = 7; // 7 rows like your image
const MAX_SEATS = 5; // 5 seats per row (each seat + S.No pair)

export default function generateSeatingPDF(jsonData) {
  if (!jsonData) {
    alert("⚠ No data found to generate PDF");
    return;
  }

  const doc = new jsPDF();

  function drawTitle(hall) {
    try {
      doc.addImage(logo, "PNG", 10, 8, 25, 18);
    } catch {}
    doc.setFontSize(18);
    doc.text("Seating Arrangement", 105, 20, { align: "center" });

    // Hall name below title
    doc.setFontSize(14);
    doc.text(`Hall: ${hall}`, 105, 30, { align: "center" });
  }

  for (let h = 0; h < hallOrder.length; h++) {
    const hall = hallOrder[h];
    const hallStudents = jsonData[hall];
    if (!hallStudents || hallStudents.length === 0) continue;

    // Generate roll numbers list
    const students = [];
    const rollCounters = {};
    hallStudents.forEach(s => {
      const key = s.department;
      if (!rollCounters[key]) rollCounters[key] = 1;
      for (let i = 0; i < s.students_count; i++) {
        const roll = `25${s.department}${rollCounters[key].toString().padStart(3, "0")}`;
        students.push(roll);
        rollCounters[key]++;
      }
    });

    // Build table body like image (Seat + S.No pair)
    const tableBody = [];
    let idx = 0;
    for (let r = 0; r < MAX_ROWS; r++) {
      const row = [];
      for (let s = 0; s < MAX_SEATS; s++) {
        if (idx < students.length) {
          row.push(students[idx]); // Seat roll number
          row.push((idx + 1).toString()); // S.No
          idx++;
        } else {
          row.push("");
          row.push("");
        }
      }
      tableBody.push(row);
    }

    // Table header: Seat 1 | S.No | Seat 2 | S.No | ...
    const headRow = [];
    for (let s = 1; s <= MAX_SEATS; s++) {
      headRow.push(`Seat ${s}`);
      headRow.push("S.No");
    }

    // New page for each hall
    if (h > 0) doc.addPage();
    drawTitle(hall);

    // Generate table
    autoTable(doc, {
      startY: 40,
      head: [headRow],
      body: tableBody,
      theme: "grid",
      styles: {
        fontSize: 10,
        halign: "center",
        valign: "middle",
        lineWidth: 0.1,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: 0,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 10 },
        2: { cellWidth: 22 },
        3: { cellWidth: 10 },
        4: { cellWidth: 22 },
        5: { cellWidth: 10 },
        6: { cellWidth: 22 },
        7: { cellWidth: 10 },
        8: { cellWidth: 22 },
        9: { cellWidth: 10 },
      },
      margin: { top: 35, left: 10, right: 10 },
    });
  }

  doc.save("hall_seating_arrangement.pdf");
}
