import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import supabase from "../supabase/client";  
import logo from "./CIT_logo.png";

// All halls
const hallOrder = [
  "F8","F9","F22","F23","S1","S2","S3","S4","S5","S6","S7","S8","S10","S15",
  "S16","S17","S18","S20","S21","S22","S23","S24","S26","S27","MS1","MS2","MS3",
  "MS4","MS5","MS6","MS7","MS8","T2","T3","T4","T6","T7","T8","T9","T10","T11",
  "T12","T13","T14","T15","T16","T17","T18","T20","T21"
];

// Year and dept mappings
const yearTableMap = { I: "YEAR_I", II: "YEAR_II", III: "YEAR_III", IV: "YEAR_IV", "CITAR-III": "CITAR_III" };
const deptMap = {
  "CIVIL":"B.E. Civil","EEE":"B.E. EEE","ECE":"B.E. ECE","MECH":"B.E. Mech","MCT":"B.E. Mctr",
  "BME":"B.E. BME","IT":"B.Tech.IT","AIDS":"B.Tech.AI-DS","CSE-AIML":"B.E. CSE (AI-ML)",
  "ECE-ACT":"B.E. ECE(ACT)","ECE-VLSI":"B.E. EE-VLSI","CSE":"B.E. CSE","CSBS":"B.Tech.CSBS",
  "CSE-CS":"B.E. CSE (CS)"
};

// Fetch roll numbers
async function getRollNumbers(year, deptExcel) {
  const deptDB = deptMap[deptExcel];
  if (!deptDB) return [];

  const tableName = yearTableMap[year];
  if (!tableName) return [];

  const { data, error } = await supabase
    .from(tableName)
    .select('"Register No"')
    .eq("Dept", deptDB)
    .order("Sl", { ascending: true });

  if (error) return [];
  return data.map(d => String(d["Register No"]));
}


export default async function generateSeatingPDF(jsonData) {
  if (!jsonData) return;

  const doc = new jsPDF();
  const rollCounters = {};
  const maxCols = 5; // columns fixed at 5
  const pageHeight = doc.internal.pageSize.height;
  const sectionHeight = (pageHeight - 40) / 2; // two halls per page
  let currentHallOnPage = 0; // 0 or 1

  // Draw page title and logo
  function drawTitle() {
    try { doc.addImage(logo, "PNG", 10, 8, 30, 18); } catch {}
    doc.setFontSize(18);
    doc.text("Seating Arrangement", 105, 25, { align: "center" });
  }

  drawTitle();

  for (let hIndex = 0; hIndex < hallOrder.length; hIndex++) {
    const hall = hallOrder[hIndex];
    const hallStudents = jsonData[hall];
    if (!hallStudents || hallStudents.length === 0) continue;

    const students = [];

    // Prepare roll numbers for students
    for (const s of hallStudents) {
      const key = `${s.year}__${s.department}`;
      if (!rollCounters[key]) {
        const rolls = await getRollNumbers(s.year, s.department);
        rollCounters[key] = { used: 0, rolls };
      }
      for (let i = 0; i < s.students_count; i++) {
        const roll = rollCounters[key].rolls[rollCounters[key].used];
        if (!roll) continue;
        students.push({ ...s, roll });
        rollCounters[key].used++;
      }
    }

    if (students.length === 0) continue;

    // Group by year & dept for alternating seating
    const groupMap = new Map();
    students.forEach(s => {
      const key = `${s.year}__${s.department}`;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key).push(s);
    });

    const queues = [...groupMap.entries()].map(([k, arr]) => ({ key: k, arr: [...arr] }));
    const seatList = [];

    while (queues.some(q => q.arr.length > 0)) {
      let firstStudent = null, firstIndex = -1;
      for (let i = 0; i < queues.length; i++) {
        if (queues[i].arr.length > 0) { firstStudent = queues[i].arr.shift(); firstIndex = i; break; }
      }
      if (!firstStudent) break;

      let secondStudent = null;
      for (let i = 0; i < queues.length; i++) {
        if (i === firstIndex) continue;
        if (queues[i].arr.length === 0) continue;
        const candidate = queues[i].arr[0];
        if (candidate.year !== firstStudent.year && candidate.department !== firstStudent.department) {
          secondStudent = queues[i].arr.shift(); break;
        }
      }

      if (!secondStudent) {
        for (let i = 0; i < queues.length; i++) {
          if (i === firstIndex) continue;
          if (queues[i].arr.length === 0) continue;
          secondStudent = queues[i].arr.shift(); break;
        }
      }

      if (secondStudent) seatList.push(`${firstStudent.roll}\n${secondStudent.roll}`);
      else seatList.push(firstStudent.roll);
    }

    // Dynamic rows based on total students
    const totalSeats = seatList.length;
    const rows = Math.ceil(totalSeats / maxCols);

    // Build grid
    const grid = Array.from({ length: rows }, () => []);
    let index = 0;
    for (let c = 0; c < maxCols; c++) {
      if (c % 2 === 0) for (let r = 0; r < rows; r++) grid[r].push(seatList[index++] || "");
      else for (let r = rows - 1; r >= 0; r--) grid[r].push(seatList[index++] || "");
    }

    // Serial numbers
    const snoGrid = Array.from({ length: rows }, () => Array(maxCols).fill(0));
    let serial = 1;
    for (let c = 0; c < maxCols; c++) {
      if (c % 2 === 0) for (let r = 0; r < rows; r++) snoGrid[r][c] = serial++;
      else for (let r = rows - 1; r >= 0; r--) snoGrid[r][c] = serial++;
    }

    const tableHeaders = [];
    for (let i = 1; i <= maxCols; i++) { tableHeaders.push(`Seat ${i}`); tableHeaders.push("S.No"); }

    const tableBody = [];
    for (let r = 0; r < rows; r++) {
      const rowArr = [];
      for (let c = 0; c < maxCols; c++) { rowArr.push(grid[r][c]); rowArr.push(snoGrid[r][c].toString()); }
      tableBody.push(rowArr);
    }

    // Set Y start for this hall section
    const sectionTop = 40 + currentHallOnPage * sectionHeight;
    doc.setFontSize(14);
    doc.text(`Hall: ${hall}`, 105, sectionTop, { align: "center" });

    autoTable(doc, {
      head: [tableHeaders],
      body: tableBody,
      startY: sectionTop + 5,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2, valign: "middle" },
      headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0], fontStyle: "bold" },
    });

    currentHallOnPage++;
    if (currentHallOnPage >= 2) { doc.addPage(); drawTitle(); currentHallOnPage = 0; }
  }

  doc.save("hall_seating_arrangement.pdf");
}