import React,{useState} from "react";
import axios from 'axios';
import generateSeatingPDF from "./pdf2";
function Upload(){
    const[file,setfile]=useState(null);
    const[json,setjson]=useState(null);
    const[mess,setmess]=useState("");


  const handleChange=(e)=>{
       if (e.target.files && e.target.files.length > 0) {
    setfile(e.target.files[0]); // ✅ correct
    setjson(null);
    setmess("");
  }
  };

  const handleClick= async()=>{
     
    if(!file){
        setmess("Please select a file");
        return;
    }
     const validExtensions = ['xlsx', 'xls'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
          setmess('Invalid file type. Please upload only .xlsx or .xls files.');
          return;
     }

     const formData=new FormData();
    formData.append('file', file);

    try{
        const response=await axios.post('http://localhost:5000/upload-excel',
            formData,{
                headers:{'Content-Type': 'multipart/form-data'},
            }
        );

         setjson(response.data);
         setmess('File processed successfully!');
    }
    catch(error){
     setmess('Error uploading file');
      console.error(error);
    }

  };
    return(
        <div>
            <h2>Seating</h2>
            <input type="file" accept=".xlsx,.xls" onChange={handleChange} />
            <button onClick={handleClick}>Upload</button>
            <p>{mess}</p>

            {json && (
                
               <div>
                  <button onClick={async () => {
  try {
    await generateSeatingPDF(json);
    setmess('PDF generated successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    setmess('Error generating PDF: ' + error.message);
  }
}}>Generate Seating PDF</button>
<pre style={{ textAlign: "left", background: "#f4f4f4", padding: "10px", borderRadius: "5px", maxHeight: "300px", overflow: "auto" }}>
      {JSON.stringify(json, null, 2)}
    </pre>
               </div>
            
            )}
         
        </div>
    );
      
 
};

export default Upload;