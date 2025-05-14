
# 📚 Student-Teacher Appointment Booking System

This is a web-based platform that allows students to search for teachers, book appointments, and communicate easily. Teachers and admins can manage appointments and registrations. Built with **React**, **Firebase**, and **Tailwind CSS**.

---

## 🔧 Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend/Database**: Firebase (Authentication, Firestore)
- **File Storage**: Firebase Storage 

---

## 🌟 Features

### 👤 Admin
- Add/Update/Delete Teachers
- Approve Student Registrations

### 👨‍🏫 Teacher
- Login
- Schedule & Approve/Cancel Appointments
- View Messages & All Appointments

### 👨‍🎓 Student
- Register/Login (OTP optional)
- Search Teachers
- Book Appointments
- Send Messages

--- Test cases
| Module  | Test Case                    | Expected Outcome            |
| ------- | ---------------------------- | --------------------------- |
| Login   | Valid email/password         | Redirect to dashboard       |
| Booking | Select teacher + date + time | Booking confirmed           |
| Admin   | Add teacher                  | Teacher appears in list     |
| Search  | Search by subject/department | Matching teachers displayed |


