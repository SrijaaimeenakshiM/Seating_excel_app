import os
from supabase import create_client, Client

# Initialize Supabase client
SUPABASE_URL = "https://bhfurrturpmvcxetgtki.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZnVycnR1cnBtdmN4ZXRndGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NzM4NDksImV4cCI6MjA3MTI0OTg0OX0.K3EC204a4VvBvmluUuz8jPr75GfBrpagfFJsRUV1JOM"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Department mapping
dept_map = {
    "CIVIL": "B.E. Civil",
    "EEE": "B.E. EEE",
    "ECE": "B.E. ECE",
    "MECH": "B.E. Mech",
    "MCT": "B.E. Mctr",
    "BME": "B.E. BME",
    "IT": "B.Tech.IT",
    "AIDS": "B.E. AIDS",
    "CSE-AIML": "B.E. CSE (AI-ML)",
    "ECE-ACT": "B.E. ECE(ACT)",
    "ECE-VLSI": "B.E. EE-VLSI",
    "CSE": "B.E. CSE",
    "CSBS": "B.Tech.CSBS",
    "CSE-CS": "B.E. CSE (CS)"
}

# Select the department
dept_code = "CIVIL"
actual_dept_name = dept_map[dept_code]

# Fetch 10 students from YEAR_III table for the department
# Step 1: Fetch all students ordered by department and register_no

response = supabase.table("CITAR_III") \
    .select('"Register No"') \
    .eq("Dept", "B.Tech.AI-DS") \
    .order("Sl") \
    .execute()

students = response.data

for student in students:
  print(student)

# students = response.data
# students = response.data

# print(students)

# Print student details
# for student in students:
#     print(student)
