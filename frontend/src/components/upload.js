import React, { useState } from "react";
import axios from "axios";
import generateSeatingPDF from "./pdf1";
import supabase from "../supabaseClient";

function Upload() {
  const [file, setFile] = useState(null);
  const [json, setJson] = useState(null);
  const [mess, setMess] = useState("");
  const [dbData, setDbData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Handle file selection
  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setJson(null);
      setMess("");
    }
  };

  // Upload Excel file
  const handleClick = async () => {
    if (!file) {
      setMess("Please select a file");
      return;
    }

    const validExtensions = ["xlsx", "xls"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setMess("Invalid file type. Please upload only .xlsx or .xls files.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/upload-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setJson(response.data);
      setMess("File processed successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      setMess("Error uploading file");
    }
  };

  // Fetch register numbers from Supabase (no date filtering)
  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from("CSE").select('"Reg_No"');
      if (error) throw error;

      setDbData(data);
      setMess("Register numbers fetched successfully!");
    } catch (err) {
      console.error("Error fetching register numbers:", err);
      setMess("Error fetching register numbers: " + err.message);
    }
  };

  // Generate PDF
  const handleGeneratePDF = async () => {
    try {
      if (!json && dbData.length === 0) {
        setMess("Please upload a file or fetch register numbers first!");
        return;
      }

      await generateSeatingPDF({
        jsonData: json,
        registerNumbers: dbData,
        fromDate,
        toDate,
      });

      setMess("PDF generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      setMess("Error generating PDF: " + error.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Seating Upload & Register Number Fetch</h2>

      {/* File Upload */}
      <div>
        <input type="file" accept=".xlsx,.xls" onChange={handleChange} />
        <button onClick={handleClick} style={{ marginLeft: "10px" }}>Upload</button>
      </div>

      {/* Date Inputs (for PDF only) */}
      <div style={{ marginTop: "20px" }}>
        <label>From: </label>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <label style={{ marginLeft: "10px" }}>To: </label>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <button onClick={fetchData} style={{ marginLeft: "10px" }}>Fetch Register Numbers</button>
      </div>

      {/* Status Message */}
      <p style={{ color: "blue", marginTop: "10px" }}>{mess}</p>

      {/* Show Uploaded Excel JSON */}
      {json && (
        <div style={{ marginTop: "20px" }}>
          <h3>Uploaded Excel Data:</h3>
          <pre style={{ textAlign: "left", background: "#f4f4f4", padding: "10px", borderRadius: "5px", maxHeight: "250px", overflow: "auto" }}>
            {JSON.stringify(json, null, 2)}
          </pre>
        </div>
      )}

      {/* Show Register Numbers */}
      {dbData.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Fetched Register Numbers:</h3>
          <ul style={{ background: "#f4f4f4", padding: "10px", borderRadius: "5px", listStyleType: "none", maxHeight: "250px", overflowY: "auto" }}>
            {dbData.map((item, index) => (
              <li key={index}>{item.Reg_No}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Generate PDF */}
      <div style={{ marginTop: "30px" }}>
        <button onClick={handleGeneratePDF} style={{ padding: "10px 20px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Generate Seating PDF
        </button>
      </div>
    </div>
  );
}

export default Upload;
