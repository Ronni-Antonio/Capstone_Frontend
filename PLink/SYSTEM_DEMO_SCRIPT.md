# Plink System Demo Script
## Introduction (30 seconds)
**Presenter:** "Hi everyone! Welcome to Plink—our rewards-based school recycling system that uses RFID technology to make recycling fun, trackable, and rewarding! Let's dive into the system!"

---

## Step 1: System Overview (1 minute)
**Presenter actions:** Show the repository structure/tech stack (if on call, share screen to show project)
- "Plink is a full-stack system with a React/Vite frontend, Laravel backend, and ESP32 + RC522 RFID hardware!"
- "We connect students to recycling using RFID cards—each time a student recycles, they earn points to redeem for rewards!"

---

## Step 2: Login (30 seconds)
**Presenter actions:** Open http://localhost:5174 (or whatever dev server port you're using)
- "First, admins log in with their credentials—let's sign in!"
- *[If you have demo credentials, use them; otherwise, show the login screen]*

---

## Step 3: Dashboard (1.5 minutes)
**Presenter actions:** Stay on Dashboard after login
- "Our Dashboard gives an at-a-glance view of the system:
  - Total bottles collected, points earned
  - Bin fullness percentage—so we know when to empty bins!
  - Daily recycling trends graph showing bottles & points per day
  - Student participation pie chart (active/inactive)
  - Weekly top-performing section
  - Quick alerts, and recent recycling activity!"
- *[Highlight key widgets like the trend graph and participation chart]*

---

## Step 4: Students Page – Activate a Card (2 minutes)
**Presenter actions:** Navigate to "Students" page via sidebar
- "Now let's manage our students! Here we can see all students with their grade, section, bottles recycled, points, and status!"
- "Let's activate a student's RFID card:
  1. Find a student with Inactive status
  2. Click the ID card icon (Activate button)
  3. The RFID scan modal opens—this tells the admin to scan the card with our ESP32 RC522 hardware!
  4. After scanning, the status updates to Active!"
- *[Show the activate modal, demonstrate the flow, then refresh to see status change]*

---

## Step 5: Sections Ranking (1 minute)
**Presenter actions:** Navigate to "Rankings" via sidebar
- "Here we have the Sections Ranking page—each section competes to see who recycles the most!
- We can see bottles recycled and points earned per section, with the top section highlighted!"
- *[Point out the ranking table, explain how points/bottles are calculated]*

---

## Step 6: Incentives & Rewards – Redemption Flow (2 minutes)
**Presenter actions:** Navigate to "Incentives" via sidebar
- "This is where the fun happens! Students can redeem their points for rewards!
- First, scan the student's RFID card to see their point balance
- Then, select a reward
- Scan the card again to confirm redemption
- The system updates their points and tracks all redemptions in the Redemptions Log!"
- *[Show the rewards list, point totals, redemption log]*

---

## Step 7: Reports & Analytics (1 minute)
**Presenter actions:** Navigate to "Reports & Analytics" via sidebar
- "Our Reports page gives deep insights:
  - Bottles by section pie chart with legend
  - Section performance bar chart
  - Recycling growth trend over time
  - Section distribution!"
- *[Highlight all graphs, explain what they show]*

---

## Step 8: Machine Monitoring (30 seconds)
**Presenter actions:** Navigate to "Machine Monitoring" via sidebar
- "Here we monitor our recycling machines—bin fullness, last collection time, and more!"
- *[Point out the bin status widgets]*

---

## Step 9: Notifications & Settings (30 seconds)
**Presenter actions:** Navigate to "Notifications" then "Settings" via sidebar
- "We also have Notifications for system alerts, and Settings to configure Plink!"

---

## Hardware Demo: ESP32 + RFID RC522 (2 minutes)
**Presenter actions:** If possible, show the physical setup
- "Now for the hardware! Our ESP32 microcontroller with the RC522 RFID module reads student cards:
  1. When a card is scanned for recycling, it sends data to the backend
  2. The system credits bottles/points to the student's account
  3. When activating or redeeming, it writes/verifies the card!"
- *[Show the ESP32 board, scan a demo card (if available), show the data update in the frontend]*

---

## Conclusion (30 seconds)
**Presenter:** "That's Plink! A complete, end-to-end recycling rewards system that motivates students, tracks impact, and makes managing the program easy for admins! Thanks for watching!"
