import os
import re
import qrcode
from PIL import Image, ImageDraw, ImageFont

# Paths
BASE_DIR = 'C:/Users/Mohammad Tabish/Documents/Shared from ubuntu/CETCF website'
TEMPLATE_PATH = os.path.join(BASE_DIR, 'certificate template', 'CERTIFICATE TEMPLATE.png')
COURSES_FILE = os.path.join(BASE_DIR, 'cetc-foundation-react', 'src', 'data', 'courses.tsx')
OUTPUT_DIR = os.path.join(BASE_DIR, 'certificate template', 'generated_certificates')

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. Parse Courses
courses = []
with open(COURSES_FILE, 'r', encoding='utf-8') as f:
    for line in f:
        # Match lines like: [1, 'Beautician & Makeup Artist', ... ]
        m = re.search(r"\[\d+,\s*['\"]([^'\"]+)['\"]", line)
        if m:
            courses.append(m.group(1))

print(f"Found {len(courses)} course entries in courses.tsx")

if len(courses) == 0:
    print("Error: No courses found. Check your regex.")
    exit(1)

# 2. Setup Font
try:
    font = ImageFont.truetype("C:/Windows/Fonts/timesbd.ttf", 34) # Slightly smaller to fit long names
except IOError:
    print("Could not load timesbd.ttf, falling back to default")
    font = ImageFont.load_default()

candidate_name = "MUSKAN SAMIR NAIK"

# 3. Process each course
base_img = Image.open(TEMPLATE_PATH)

for i, course in enumerate(courses):
    img = base_img.copy()
    draw = ImageDraw.Draw(img)
    
    # 3a. Generate QR Code
    qr_data = f"Name: {candidate_name}\nAadhar: XXXX-XXXX-1234\nIssue Date: 23/04/2026\nCourse: {course}\nStatus: Verified"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    # Resize QR to fit in the box exactly. The box seems to be around 170x170 based on screenshot.
    qr_size = 159
    qr_img = qr_img.resize((qr_size, qr_size), Image.Resampling.LANCZOS)
    
    # Paste QR code onto certificate
    qr_x, qr_y = 147, 1115
    img.paste(qr_img, (qr_x, qr_y))
    
    # Draw black border around the new QR code
    draw.rectangle([qr_x, qr_y, qr_x + qr_size, qr_y + qr_size], outline="black", width=4)
    
    # 3b. Add Course Name Text
    # Centered at Y=660
    course_y = 665
    
    # Calculate text width to center it
    bbox = font.getbbox(course)
    text_w = bbox[2] - bbox[0]
    text_x = 526 - (text_w / 2)
    
    draw.text((text_x, course_y - 40), course, fill=(0, 0, 0), font=font)
    
    # Save Image
    safe_name = re.sub(r'[\\/*?:"<>|]', "", course)
    out_path = os.path.join(OUTPUT_DIR, f"{safe_name}.png")
    img.save(out_path)
    
    if (i+1) % 50 == 0:
        print(f"Generated {i+1}/{len(courses)} certificates...")

print(f"Done! Generated {len(courses)} certificates in {OUTPUT_DIR}")
