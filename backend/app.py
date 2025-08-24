from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS
from collections import defaultdict

app = Flask(__name__)
CORS(app)

@app.route('/upload-excel', methods=['POST'])
def upload_excel():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    df = pd.read_excel(file, header=4)
    df = df.iloc[:, 1:]
    df['Branch'] = df['Branch'].ffill()
    df = df.dropna(subset=['YEAR','Strength']) 

    hall_grouped = defaultdict(list)

    for idx, row in df.iterrows():
        branch = row['Branch']
        year = row['YEAR']

        for col in df.columns:
            if col not in ['S.No.', 'Branch', 'YEAR', 'Strength', 'Boys', 'Girls', 'TOTAL']:
                val = row[col]
                try:
                    val_int = int(float(val))
                    if val_int > 0:
                        hall_grouped[col.strip()].append({
                            "students_count": val_int,
                            "department": branch,
                            "year": year
                        })
                except (ValueError, TypeError):
                    continue

    return jsonify(hall_grouped)

if __name__ == '__main__':
    app.run(debug=True)
