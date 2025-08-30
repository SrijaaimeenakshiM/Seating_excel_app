import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import supabase from "../supabase/client"; 
import logo from "./CIT_logo.png";

const hallOrder = [
  "F8","F9","F22","F23","S1","S2","S3","S4","S5","S6","S7","S8","S10","S15",
  "S16","S17","S18","S20","S21","S22","S23","S24","S26","S27","MS1","MS2","MS3",
  "MS4","MS5","MS6","MS7","MS8","T2","T3","T4","T6","T7","T8","T9","T10","T11",
  "T12","T13","T14","T15","T16","T17","T18","T20","T21"
];

const yearTableMap = {
  I: "YEAR_I",
  II: "YEAR_II",
  III: "YEAR_III",
  IV: "YEAR_IV",
  "CITAR-III": "CITAR_III",  
};

const deptMap = {
  "CIVIL": "B.E. Civil",
  "EEE": "B.E. EEE",
  "ECE": "B.E. ECE",
  "MECH": "B.E. Mech",
  "MCT": "B.E. Mctr",
  "BME": "B.E. BME",
  "IT": "B.Tech.IT",
  "AIDS": "B.Tech.AI-DS",
  "CSE-AIML": "B.E. CSE (AI-ML)",
  "ECE-ACT": "B.E. ECE(ACT)",
  "ECE-VLSI": "B.E. EE-VLSI",
  "CSE": "B.E. CSE",
  "CSBS": "B.Tech.CSBS",
  "CSE-CS": "B.E. CSE (CS)",
};

async function getRollNumbers(year, deptExcel) {
 
  let deptDB = deptMap[deptExcel];

  if (!deptDB) {
    console.error("❌ Unknown department mapping for:", deptExcel);
    return [];
  }


  const tableName = yearTableMap[year];
  if (!tableName) {
    console.error("❌ Unknown year mapping:", year);
    return [];
  }


  const { data, error } = await supabase
    .from(tableName)
    .select('"Register No"')
    .eq("Dept", deptDB)
    .order("Sl", { ascending: true });

  if (error) {
    console.error("❌ Supabase fetch error:", error);
    return [];
  }

  return data.map(d => String(d["Register No"]));
}




export default async function generateSeatingPDF(json){
  if(!json) return;//if empty return

  const doc=new jsPDF();
  const rollcounter={};
  for(let hallno=0;hallno<hallOrder.length;hallno++){
     const hall=hallOrder[hallno];
     const students=json[hall];

     if(!students||students.length==0) continue;

     let yStart = 50; // initial vertical start for first hall
     const spacingBetweenHalls = 20;

     try{
      doc.addImage(logo,"PNG",10,8,30,18);//from left,from top,width,height

     }
     catch{}

    // Add hall header
doc.setFontSize(18);
doc.text(`Seating Arrangement - Hall: ${hall}`, 105, yStart, { align: "center" });


  const savestudents=[];
    for(const s of students){
       const key=`${s.year}_${s.department}`
       if(!rollcounter[key]){
        const rolls = await getRollNumbers(s.year, s.department);
        console.log(">>> Rolls fetched for", s.year, s.department, rolls.length, rolls.slice(0,10));
        rollcounter[key] = { used: 0, rolls };
       }

       for(let i=0;i< s.students_count;i++){
         const roll=rollcounter[key].rolls[rollcounter[key].used];
         if (!roll) {
          console.warn(`No more rolls left for ${key} at index ${i}`);
          continue;
        }
        savestudents.push(roll);
        rollcounter[key].used++;
       }

    }

   let y = yStart + 10; 
  for (let i = 0; i < savestudents.length; i += 2) {
    const first = savestudents[i];
    const second = savestudents[i + 1];
    if (second)
        doc.text(`${first}\t${second}`, 20, y);
    else
        doc.text(`${first}`, 20, y);
    y += 10;
}


  yStart = y + spacingBetweenHalls;


  if (yStart > 280) {
    doc.addPage();
    yStart = 50;
  }

  }
  doc.save("SeatingArrangement.pdf");
}