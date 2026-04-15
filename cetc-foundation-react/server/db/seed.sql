-- ============================================================
-- CETCF FOUNDATION — SEED DATA (Development / Testing)
-- ============================================================

-- Default Admin
INSERT INTO admins (email, password_hash, name) VALUES
  ('admin@cetcfoundation.org', '$2b$10$rOzJqZzZzZzZzZzZzZzZeO5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Quu', 'CETC Admin')
  ON CONFLICT (email) DO NOTHING;
-- Default password: Admin@CETCF2025

-- Certification Trades (8 trades as per spec)
INSERT INTO trades (code, name, description, fee, passing_marks, question_count, duration_mins, commission_rate, syllabus_topics) VALUES
  ('BEAUTY', 'Beauty & Wellness', 'Beautician, Makeup Artist, Salon Management techniques covering skin care, hair styling, and client management.', 1000, 40, 60, 90, 250, ARRAY['Skin Care Basics','Hair Styling Techniques','Nail Art & Care','Makeup Application','Salon Sanitation & Hygiene','Client Communication']),
  ('PLUMB', 'Plumbing & Sanitation', 'Residential and commercial plumbing including pipe fitting, fixture installation, and sanitation systems.', 1000, 40, 60, 90, 200, ARRAY['Pipe Types & Selection','Water Supply Systems','Drainage Systems','Fixture Installation','Leak Detection & Repair','Safety Protocols']),
  ('ELEC', 'Electrician', 'Domestic and industrial electrical installation, wiring, and safety standards per Indian Electricity Act.', 1000, 40, 60, 90, 200, ARRAY['Electrical Fundamentals','Domestic Wiring','Industrial Installations','Safety Standards','Energy Meters','MCB & ELCB Fitting']),
  ('WELD', 'Welding Technology', 'Arc welding, MIG welding, and gas welding techniques for structural and industrial applications.', 1000, 40, 60, 90, 200, ARRAY['Arc Welding','MIG/MAG Welding','Gas Welding','Joint Types','Safety & PPE','Weld Quality Testing']),
  ('COMPOP', 'Computer Operator', 'MS Office, data entry, internet usage, tally, and basic computer operations for modern workplaces.', 1000, 40, 60, 90, 200, ARRAY['MS Word & Excel','Internet & Email','Data Entry Techniques','Tally ERP Basics','Cybersecurity Awareness','Typing Speed & Accuracy']),
  ('RETAIL', 'Retail Sales Associate', 'Customer service, POS operations, inventory management, and visual merchandising for retail outlets.', 1000, 40, 60, 90, 200, ARRAY['Customer Service Skills','POS & Billing','Inventory Management','Visual Merchandising','Returns & Refunds Handling','Upselling Techniques']),
  ('TAILOR', 'Tailoring & Fashion', 'Cutting, stitching, embroidery, and garment finishing for ladies and gents fashion wear.', 1000, 40, 60, 90, 200, ARRAY['Measurement & Cutting','Stitching Techniques','Pattern Making','Embroidery Basics','Garment Finishing','Fashion Trends']),
  ('MASON', 'Masonry & Construction', 'Brick laying, plastering, tiling, and general construction work as per IS codes.', 1000, 40, 60, 90, 200, ARRAY['Brick Laying','Cement & Mortar Mixing','Plastering Techniques','Floor & Wall Tiling','Reading Construction Drawings','Safety on Site'])
  ON CONFLICT (code) DO NOTHING;

-- Sample Questions for Beauty trade (30 questions to start)
INSERT INTO questions (trade_id, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, status) VALUES
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'What is the main function of a toner in skin care?', 'To remove makeup', 'To restore skin pH balance after cleansing', 'To apply moisture to skin', 'To protect from sun', 'B', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'Which hair type is characterized by tight curls with high shrinkage?', 'Type 1 (Straight)', 'Type 2 (Wavy)', 'Type 3 (Curly)', 'Type 4 (Coily)', 'D', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'What does SPF stand for in sunscreen?', 'Sun Protection Foundation', 'Sun Protection Factor', 'Skin Protection Formula', 'Solar Prevention Factor', 'B', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'Which tool is used to create loose, bouncy curls?', 'Flat iron', 'Crimper', 'Curling iron', 'Diffuser', 'C', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'What is the correct order of CTM routine?', 'Tone, Cleanse, Moisturize', 'Cleanse, Tone, Moisturize', 'Moisturize, Cleanse, Tone', 'Cleanse, Moisturize, Tone', 'B', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'Which vitamin is known as the anti-aging vitamin in skin care?', 'Vitamin A (Retinol)', 'Vitamin D', 'Vitamin K', 'Vitamin B12', 'A', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'What percentage of hydrogen peroxide is safe for home hair coloring?', '6%', '9%', '3%', '12%', 'C', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'In nail art, what is a "builder gel" used for?', 'Nail color application', 'Adding length and strength to nails', 'Nail prep and cleaning', 'UV protection', 'B', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'What is the function of cuticle oil?', 'Harden the nail plate', 'Moisturize and nourish the nail cuticle', 'Remove dead skin', 'Sanitize the nails', 'B', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'Which skin condition is caused by blocked sebaceous glands?', 'Eczema', 'Psoriasis', 'Acne', 'Rosacea', 'C', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'What is the Fitzpatrick scale used for?', 'Measuring hair porosity', 'Classifying skin types based on melanin content', 'Measuring nail hardness', 'Grading makeup foundation shades', 'B', 'hard', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'Which chemical in hair relaxers breaks disulfide bonds?', 'Ammonium thioglycolate', 'Hydrogen peroxide', 'Sodium hydroxide', 'Both A and C can be used depending on relaxer type', 'D', 'hard', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'Under which law is a beauty establishment licensed in Maharashtra?', 'Shops & Establishments Act 1948', 'ESIC Act 1948', 'Maharashtra Factories Act', 'Consumer Protection Act 2019', 'A', 'hard', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'What does cross-contamination mean in a salon environment?', 'Mixing hair colors', 'Transfer of microorganisms from one surface to another', 'Using expired products', 'Serving multiple clients at once', 'B', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'Which color wheel color is opposite to red?', 'Orange', 'Purple', 'Green', 'Blue', 'C', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'What is the purpose of a patch test before hair coloring?', 'To check color accuracy', 'To detect allergic reactions before full application', 'To moisturize the scalp', 'To ensure even coverage', 'B', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'Which nail file grit is best for natural nails?', '80-100 grit', '180-240 grit', '400+ grit', '60 grit', 'B', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'What is balayage?', 'A hair straightening technique', 'A freehand painting technique to lighten hair', 'A scalp treatment', 'A chemical straightening process', 'B', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'Which ingredient acts as a humectant in skin care?', 'Mineral oil', 'Hyaluronic acid', 'Zinc oxide', 'Salicylic acid', 'B', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'What does emollient mean in a moisturizer?', 'It removes dead cells', 'It seals moisture into skin', 'It softens and smooths skin', 'It increases collagen production', 'C', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'What is the ideal room temperature for providing facial treatments?', '18-21°C', '25-28°C', '30-35°C', '10-15°C', 'A', 'hard', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'What is meant by "double cleansing"?', 'Using two different brands of cleanser', 'Using an oil-based cleanser followed by a water-based cleanser', 'Cleansing twice a day', 'Foam cleansing twice in a row', 'B', 'hard', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'How should bleaching cream be mixed for skin treatment?', 'Mix with water', 'Mix with alkaline activator as directed', 'Apply directly without mixing', 'Mix with toner', 'B', 'hard', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'What is OPI in nail care?', 'A type of UV lamp', 'A popular professional nail care brand', 'A nail prep technique', 'A nail disease', 'B', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'Which skin type has visible pores, T-zone oiliness, and dry cheeks?', 'Oily skin', 'Dry skin', 'Normal skin', 'Combination skin', 'D', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'A client has extremely sensitive skin. Which product to avoid?', 'Aloe vera gel', 'Products with alcohol or strong fragrance', 'Hyaluronic acid serum', 'Gentle micellar water', 'B', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'What does "porosity" mean in hair science?', 'The ability of hair to hold color permanently', 'How well hair absorbs and retains moisture', 'The natural shine of the hair', 'The thickness of individual hair strands', 'B', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'What is a highlight in makeup application?', 'Dark product applied to recessed areas', 'Light product applied to raised facial features', 'Blush applied to the cheeks', 'Any bold eyeshadow color', 'B', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'Which tool creates a smooth, even base of foundation on skin?', 'Kabuki brush', 'Fan brush', 'Beauty blender/sponge', 'Liner brush', 'C', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='BEAUTY'), 'What safety precaution must be taken when using UV nail lamps?', 'Wear dark sunglasses', 'Apply SPF protection on hands or wear UV-protective gloves', 'Soak fingers in water first', 'Avoid any ventilation', 'B', 'medium', 'approved');

-- Sample Questions for Computer Operator trade (30 questions)
INSERT INTO questions (trade_id, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, status) VALUES
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What is the shortcut key to Save a document in MS Word?', 'Ctrl+P', 'Ctrl+S', 'Ctrl+A', 'Alt+S', 'B', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'Which of the following is NOT a web browser?', 'Google Chrome', 'Mozilla Firefox', 'MS Excel', 'Microsoft Edge', 'C', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What does RAM stand for?', 'Read All Memory', 'Random Access Memory', 'Rapid Application Memory', 'Runtime Access Module', 'B', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'In Excel, which function adds a range of numbers?', 'COUNT()', 'ADD()', 'SUM()', 'TOTAL()', 'C', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What is the extension of an MS Word 2016 file?', '.doc', '.xls', '.docx', '.txt', 'C', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What does "Ctrl+Z" do?', 'Redo', 'Cut', 'Undo', 'Zoom', 'C', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'Which is the first cell address in Excel?', 'A0', 'A1', '1A', 'AA', 'B', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What is phishing?', 'A type of computer virus', 'A cyberattack using fake emails to steal information', 'Hacking a WiFi network', 'Illegal file downloading', 'B', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'In Excel, which formula would you use to find the average of A1 to A10?', '=MEAN(A1:A10)', '=AVG(A1:A10)', '=AVERAGE(A1:A10)', '=MID(A1:A10)', 'C', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What is the maximum number of rows in MS Excel 2016?', '65,536', '1,000,000', '1,048,576', '500,000', 'C', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What does Tally ERP stand for?', 'Total Accounting Ledger Level Yearly', 'Tally is a brand name; ERP stands for Enterprise Resource Planning', 'Tax Accounting Ledger for Retail Planning', 'None of the above', 'B', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'Which of the following is an input device?', 'Monitor', 'Printer', 'Scanner', 'Speaker', 'C', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What is the function of a firewall?', 'Speed up internet connection', 'Monitor and control incoming/outgoing network traffic', 'Store data permanently', 'Recover lost files', 'B', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What is VLOOKUP in Excel?', 'A function to find a specific value in the first column of a range', 'A shortcut to format cells', 'A chart type', 'A data validation tool', 'A', 'hard', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What does "www" stand for in a URL?', 'World Wide Web', 'Wide World Web', 'Web World Wide', 'Western Wire Web', 'A', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What is the purpose of the COUNTIF function in Excel?', 'Counts numbers in a range', 'Counts cells that meet a specific condition', 'Sums numbers meeting a condition', 'Finds text in a cell', 'B', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What type of software is an antivirus?', 'Application software', 'System utility software', 'Programming software', 'Firmware', 'B', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'Which keyboard shortcut opens Task Manager in Windows?', 'Ctrl+Alt+Delete', 'Ctrl+Shift+Esc', 'Alt+F4', 'Both A and B', 'D', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What is cloud storage?', 'Storage on a local hard disk', 'Online data storage accessible via internet', 'A type of RAM', 'Backup on a USB drive', 'B', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'Which file format is used for email attachments with maximum compatibility?', '.exe', '.pdf', '.bat', '.dll', 'B', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'In Tally, the shortcut key to create a voucher is?', 'Alt+C', 'F6 (for receipt)', 'Ctrl+N', 'Alt+V', 'B', 'hard', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What is a Pivot Table in Excel used for?', 'Creating charts only', 'Summarizing and analyzing large data sets', 'Sorting data alphabetically', 'Merging cells', 'B', 'hard', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What is the difference between Save and Save As?', 'No difference', 'Save As lets you choose new filename/location; Save overwrites existing file', 'Save creates a copy; Save As replaces original', 'Save As is used for images only', 'B', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'Which protocol is used for secure email sending?', 'HTTP', 'FTP', 'SMTP with TLS/SSL', 'UDP', 'C', 'hard', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What is 2-Factor Authentication (2FA)?', 'Using two passwords for login', 'Adding a second verification step (OTP/code) after password', 'Logging in from two devices', 'Encrypting data twice', 'B', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What does "Boolean" mean in computing?', 'A type of loop', 'A data type with only two values: True or False', 'A large integer value', 'A type of network', 'B', 'hard', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'Which symbol starts a formula in Excel?', '#', '@', '=', '&', 'C', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What is the purpose of "Conditional Formatting" in Excel?', 'Changing font style', 'Applying formats based on cell values or rules', 'Inserting formulas', 'Merging rows', 'B', 'medium', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'What does ISP stand for?', 'Internet Security Protocol', 'Internet Service Provider', 'Internal Software Package', 'Integrated System Program', 'B', 'easy', 'approved'),
  ((SELECT id FROM trades WHERE code='COMPOP'), 'A macro in MS Excel is?', 'A large table', 'A recorded sequence of actions that can be replayed', 'A type of chart', 'A formula error indicator', 'B', 'hard', 'approved');
