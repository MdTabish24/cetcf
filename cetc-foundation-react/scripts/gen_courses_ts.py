"""Generate courses.ts data file from the Excel spreadsheet."""
import json, sys, openpyxl

excel_path = sys.argv[1]
wb = openpyxl.load_workbook(excel_path)
ws = wb.active

courses = []
for row in ws.iter_rows(min_row=2, max_row=ws.max_row):
    vals = [cell.value for cell in row]
    if vals[1]:
        sno = vals[0]
        name = str(vals[1]).replace('\u2013', '–').replace('\u2014', '—')  # normalize dashes
        sector = str(vals[2]) if vals[2] else ''
        duration = str(vals[3]) if vals[3] else ''
        level = str(vals[4]) if vals[4] else 'Foundation'
        courses.append((sno, name, sector, duration, level))

# Print as TypeScript array
lines = []
for sno, name, sector, duration, level in courses:
    # Escape single quotes in names
    name_esc = name.replace("'", "\\'")
    sector_esc = sector.replace("'", "\\'")
    lines.append(f"  [{sno}, '{name_esc}', '{sector_esc}', '{duration}', '{level}'],")

print("// Auto-generated from CETCF_Course_List.xlsx")
print(f"// Total: {len(courses)} courses")
print("const RAW_COURSES: Array<[number, string, string, string, string]> = [")
for line in lines:
    print(line)
print("];")

# Also print unique sectors
sectors = sorted(set(c[2] for c in courses))
print(f"\n// {len(sectors)} unique sectors:")
for s in sectors:
    count = sum(1 for c in courses if c[2] == s)
    print(f"//   {count:3d} {s}")
