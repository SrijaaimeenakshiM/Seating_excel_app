import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "./CIT_logo.png"; // logo image

const deptCodeMap = {
  CSE: "CS",
  IT: "IT",
  CIVIL: "CE",
  ECE: "EC",
  MEC: "ME",
  MCT: "MT",
  BME: "BM",
  AIDS: "AD",
  AIML: "AM",
  ACT: "AC",
  VLSI: "VL",
  CSBS: "CB",
  EEE: "EE",
  "CSE-CS": "CZ",
};

const hallOrder = [
  "F8","F9","F22","F23","S1","S2","S3","S4","S5","S6","S7","S8","S10","S15",
  "S16","S17","S18","S20","S21","S22","S23","S24","S26","S27","MS1","MS2","MS3",
  "MS4","MS5","MS6","MS7","MS8","T2","T3","T4","T6","T7","T8","T9","T10","T11",
  "T12","T13","T14","T15","T16","T17","T18","T20","T21"
];


  const getYearPrefix = (year, dept) => {
    const yearCodeMap = {
      "1st": "25",
      "2nd": "23",
      "3rd": "23",
      "CITAR-3rd": "40001",
      "4th": "22",
    };
    const yearCode = yearCodeMap[year] || "XX";
    const deptCode = deptCodeMap[dept] || "XX";
    return `${yearCode}${deptCode}`;
  };
  const generateSeatingPDF = (jsonData) => {
    if (!jsonData) return;
    const doc = new jsPDF();
    const rollCounters = {};

    hallOrder.forEach((hall, hIndex) => {
      const hallStudents = jsonData[hall];
      if (!hallStudents || hallStudents.length === 0) return;

      if (hIndex > 0) doc.addPage();

      try {
        doc.addImage(logo, "PNG", 10, 8, 30, 18);
      } catch {}

      doc.setFontSize(18);
      doc.text("Seating Arrangement", 105, 24, { align: "center" });
      doc.setFontSize(14);
      doc.text(`Hall: ${hall}`, 105, 34, { align: "center" });

      const students = [];
      hallStudents.forEach((s) => {
        const key = `${s.year}__${s.department}`;
        if (!rollCounters[key]) rollCounters[key] = 1;
        const prefix = getYearPrefix(s.year, s.department);
        for (let i = 0; i < s.students_count; i++) {
          students.push({
            roll: `${prefix}${String(rollCounters[key]).padStart(4, "0")}`,
            year: s.year,
            department: s.department,
          });
          rollCounters[key]++;
        }
      });

      const groupMap = new Map();
      students.forEach((s) => {
        const key = `${s.year}__${s.department}`;
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key).push(s);
      });

      const queues = [...groupMap.entries()].map(([k, arr]) => ({ key: k, arr: [...arr] }));
      const seatList = [];
      while (queues.some((q) => q.arr.length > 0)) {
        let firstStudent = null;
        let firstIndex = -1;
        for (let i = 0; i < queues.length; i++) {
          if (queues[i].arr.length > 0) {
            firstStudent = queues[i].arr.shift();
            firstIndex = i;
            break;
          }
        }
        if (!firstStudent) break;

        let secondStudent = null;
        for (let i = 0; i < queues.length; i++) {
          if (i === firstIndex) continue;
          if (queues[i].arr.length === 0) continue;
          const candidate = queues[i].arr[0];
          if (candidate.year !== firstStudent.year && candidate.department !== firstStudent.department) {
            secondStudent = queues[i].arr.shift();
            break;
          }
        }
        if (!secondStudent) {
          for (let i = 0; i < queues.length; i++) {
            if (i === firstIndex) continue;
            if (queues[i].arr.length === 0) continue;
            secondStudent = queues[i].arr.shift();
            break;
          }
        }

        if (secondStudent) seatList.push(`${firstStudent.roll}\n${secondStudent.roll}`);
        else seatList.push(firstStudent.roll);
      }

      // Change grid to 7 rows × 5 columns
      const rows = 7;
      const cols = 5;
      const grid = Array.from({ length: rows }, () => []);
      let seatIndex = 0;
      for (let c = 0; c < cols; c++) {
        if (c % 2 === 0) {
          for (let r = 0; r < rows; r++) grid[r].push(seatList[seatIndex++] || "");
        } else {
          for (let r = rows - 1; r >= 0; r--) grid[r].push(seatList[seatIndex++] || "");
        }
      }

      const snoGrid = Array.from({ length: rows }, () => Array(cols).fill(0));
      let serial = 1;
      for (let c = 0; c < cols; c++) {
        if (c % 2 === 0) {
          for (let r = 0; r < rows; r++) snoGrid[r][c] = serial++;
        } else {
          for (let r = rows - 1; r >= 0; r--) snoGrid[r][c] = serial++;
        }
      }

      const tableHeaders = [];
      for (let i = 1; i <= cols; i++) {
        tableHeaders.push(`Row ${i}`);
        tableHeaders.push("S.No");
      }

      const tableBody = [];
      for (let r = 0; r < rows; r++) {
        const rowArr = [];
        for (let c = 0; c < cols; c++) {
          rowArr.push(grid[r][c]);
          rowArr.push(String(snoGrid[r][c]));
        }
        tableBody.push(rowArr);
      }

      doc.autoTable({
            head: [tableHeaders],
            body: tableBody,
            startY: 50,
            theme: "grid",
            styles: { fontSize: 9, cellPadding: 2, valign: "middle" },
            headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
      });
    })

    doc.save("hall_seating_arrangement.pdf");
  };



export default generateSeatingPDF;
