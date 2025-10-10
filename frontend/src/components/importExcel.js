const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const connectDB = require("./db");
const Student = require("./models/student");

const folderPath = "./Users/barka/Downloads/2025-REG NO ExamCELL (1).xlsx"; // folder containing all Excel files

const importExcelFiles = async () => {
  await connectDB();

  const files = fs.readdirSync(folderPath).filter(file => file.endsWith(".xlsx"));

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(sheet);

    for (const row of data) {
      const student = new Student({
        sno: row["S.No"] || row["s.no"] || row["sno"],
        rollNo: row["Roll No"] || row["roll no"] || row["RollNo"],
        department: row["Department"] || row["department"],
        section: row["Section"] || row["section"],
        name: row["Name"] || row["name"],
        quota: row["Quota"] || row["quota"],
        cutoff: row["Cutoff"] || row["cutoff"],
        gender: row["Gender"] || row["gender"],
        H_or_D: row["H or D"] || row["H_or_D"] || row["H/D"],
        boardOfStudy: row["Board of Study"] || row["board of study"]
      });

      await student.save();
    }

    console.log(`${file} imported successfully`);
  }

  console.log("All files imported");
  process.exit(0);
};

importExcelFiles();
