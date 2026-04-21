# Excel Upload Guide

This guide explains the required format for uploading data via Excel files in the Student Management Portal.

---

## 🎓 Timetable Upload Format

**File Name:** `timetable.xlsx`

**Required Columns:**
- **Day** (Required) - Day of week (Monday, Tuesday, Wednesday, Thursday, Friday)
- **Time** (Required) - Time slot (e.g., 09:00-10:00)
- **Subject** (Required) - Subject name (e.g., Data Structures)
- **Room** (Required) - Room number (e.g., A101)
- **Faculty** (Optional) - Faculty name (default: TBD)
- **Resource** (Optional) - Resource details (e.g., Projector, Lab Equipment)
- **Dept** (Optional) - Department (e.g., CSE, ECE) (default: ALL)
- **Section** (Optional) - Section (e.g., A, B, C) (default: ALL)
- **Semester** (Optional) - Semester number (1-8) (default: 0)

**Example:**

| Day       | Time        | Subject          | Room | Faculty    | Resource      | Dept | Section | Semester |
|-----------|-------------|------------------|------|------------|---------------|------|---------|----------|
| Monday    | 09:00-10:00 | Data Structures  | A101 | Dr. Smith  | Projector     | CSE  | A       | 3        |
| Monday    | 10:00-11:00 | Web Development  | A102 | Prof. John | Lab Equipment | CSE  | A       | 3        |
| Tuesday   | 09:00-10:00 | Database Systems | A103 | Dr. Brown  |               | CSE  | B       | 3        |
| Wednesday | 14:00-15:00 | Operating System | A104 | Dr. Lee    | Whiteboard    | CSE  | A       | 4        |

---

## 📢 Announcements Upload Format

**File Name:** `announcements.xlsx`

**Required Columns:**
- **Title** (Required) - Announcement title
- **Body** (Required) - Announcement content/description
- **Priority** (Optional) - Priority level (normal, high, urgent) (default: normal)
- **Image** (Optional) - Image URL

**Example:**

| Title                    | Body                                      | Priority | Image |
|--------------------------|-------------------------------------------|----------|-------|
| Campus Closure Notice    | The campus will be closed on Friday       | urgent   |       |
| New Library Hours        | Library is now open until 10 PM           | normal   |       |
| Exam Schedule Released   | Semester exams schedule is now available  | high     |       |
| Holiday Announcement     | College closed for national holiday       | normal   |       |

---

## ✅ Attendance Upload Format

**File Name:** `attendance.xlsx`

**Required Columns:**
- **Email** (Required) - Student email address
- **Date** (Required) - Date of attendance (YYYY-MM-DD or MM/DD/YYYY)
- **Subject** (Required) - Subject name
- **Status** (Required) - Attendance status (present or absent)

**Example:**

| Email                    | Date       | Subject          | Status  |
|--------------------------|------------|------------------|---------|
| student1@college.edu     | 2024-03-01 | Data Structures  | present |
| student1@college.edu     | 2024-03-02 | Web Development  | present |
| student1@college.edu     | 2024-03-03 | Database Systems | absent  |
| student2@college.edu     | 2024-03-01 | Data Structures  | present |
| student2@college.edu     | 2024-03-02 | Web Development  | absent  |

---

## 📋 Important Notes

### General Requirements
1. **Headers are case-insensitive**: You can use "Day", "day", or "DAY"
2. **First row should contain headers** - The first row is treated as column headers
3. **Excel format**: Files must be `.xlsx` or `.xls` format
4. **No special characters in data** - Avoid special characters that might cause parsing issues
5. **Trim whitespace**: Leading/trailing spaces will be automatically removed

### Upload Steps
1. Go to Admin Dashboard
2. Navigate to the respective management section
   - Timetable: "Manage Timetable" → Click "Upload Excel" button
   - Announcements: "Manage Announcements" → Click "Upload Excel" button
   - Attendance: "Manage Attendance" → Click "Upload Excel" button
3. Select your prepared Excel file
4. Wait for processing and confirmation

### Error Handling
- If a row has errors, it will be skipped and shown in the error count
- Successful rows will be uploaded to Firestore
- A summary message will show: "✓ Uploaded X records | ❌ Y failed"
- Check the console (F12) for detailed error messages

### Best Practices
1. **Validate data before uploading**: Ensure all required fields are filled
2. **Use consistent formatting**: Use the same date format throughout the file
3. **Save a backup**: Keep a copy of your Excel file
4. **Upload in batches**: For large files, consider uploading in smaller batches
5. **Review after upload**: Check the portal after upload to verify data was imported correctly

---

## 📝 Sample Excel Templates

### Creating from Scratch
1. Open Microsoft Excel or Google Sheets
2. Create headers as shown in the format tables above
3. Fill in your data
4. Save as Excel file (.xlsx)

### Tips for Smooth Upload
- Use "No Format" for cells to avoid special formatting
- Remove empty rows at the end of the file
- Double-check date formats (use YYYY-MM-DD for consistency)
- Verify email addresses are correct and lowercase

---

## ⚠️ Troubleshooting

**Q: Upload button doesn't respond?**
- Ensure you have selected an Excel file (.xlsx or .xls)
- Check browser console (F12) for errors
- Make sure you have admin privileges

**Q: Data not appearing after upload?**
- Click "Refresh" button to reload the page
- Check that all required fields were filled in the Excel
- Verify the data format matches the requirements

**Q: Getting "Missing required fields" error?**
- Check that columns Day, Time, Subject, Room exist for timetable
- Check Title and Body exist for announcements
- Check Email, Date, Subject, Status exist for attendance
- Ensure column names exactly match (case-insensitive)

**Q: Some rows uploaded but others failed?**
- Individual row errors don't stop the entire upload
- Check the success count message for details
- Review the console for specific row errors

---

## 🎯 Quick Checklist

- [ ] File format is .xlsx or .xls
- [ ] First row contains column headers
- [ ] All required columns are present
- [ ] Data is properly formatted (dates, times, etc.)
- [ ] No empty required fields
- [ ] Email addresses are correct and lowercase
- [ ] File is under 5MB (recommended)
- [ ] Downloaded template format matches your data

---

For more help, contact the administrator or check the browser console (F12) for detailed error messages.
