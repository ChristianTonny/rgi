# User Action Checklist - NISR 2025 Hackathon Submission

**Platform Status**: ✅ FULLY FUNCTIONAL & DEMO-READY  
**Deadline**: October 10, 2025  
**Days Remaining**: 2 days

---

## 🚨 URGENT ACTIONS (Must Complete Today - Oct 8)

### ☐ 1. Record Demo Video
**Time Required**: 1-2 hours (including retakes)  
**Tools Needed**: Screen Castify (free Chrome extension)

**Steps**:
1. Install Screen Castify from Chrome Web Store
2. Start both servers:
   ```bash
   # Terminal 1: Start backend
   cd /home/runner/work/rgi/rgi
   node server/index.js
   
   # Terminal 2: Start frontend
   npm run dev
   ```
3. Clear browser cache and downloads folder
4. Record 2-3 minute silent screen capture following the script below
5. Upload to YouTube (unlisted) or Vimeo
6. Copy video link

**Demo Script** (2 minutes):
- **Scene 1 (30s)**: Login → Dashboard with NISR data visible
- **Scene 2 (30s)**: Hover over intelligence cards showing NISR citations
- **Scene 3 (30s)**: Click "Generate Budget Report" → Show CSV download
- **Scene 4 (30s)**: Navigate between tabs, show search functionality

**Key Points to Highlight**:
- ✅ Real NISR data (not mock) - show citations
- ✅ Dashboard intelligence cards with statistics
- ✅ CSV export functionality
- ✅ Professional UI with Rwanda government branding

---

### ☐ 2. Update Team Information in README.md

**File**: `/home/runner/work/rgi/rgi/README.md`  
**Section**: Lines 322-330 (Team section)

**Replace**:
```markdown
## 👥 Team

**[Team Info - Fill in based on your status]**

- **Team Type:** [Student Team / Fresh Graduate Individual]
- **Members:**
  - [Name] - [University/Role] - [Email]
  - [Name 2] - [University/Role] - [Email] *(if student team)*
```

**With** (example):
```markdown
## 👥 Team

**Team Type:** Student Team

**Members:**
- Christian Tonny - Computer Science, University of Rwanda - christian.tonny@example.com
- [Teammate Name] - [Program], [University] - [email] *(if you have a teammate)*

**OR** (if fresh graduate):

**Team Type:** Fresh Graduate Individual

**Participant:**
- Christian Tonny - Fresh Graduate 2024, Computer Science - christian.tonny@example.com
```

**Important**:
- If you're a **student** (enrolled 2024-2025): You NEED 1 teammate
- If you're a **fresh graduate** (graduated 2024-2025): Compete individually
- Make sure email addresses are correct for prize notification

---

### ☐ 3. Add Demo Video Link to README.md

**File**: `/home/runner/work/rgi/rgi/README.md`  
**Section**: Lines 81-90 (Demo Video section)

**Replace**:
```markdown
## 🎥 Demo Video

**[Demo Video Link]** *(2-3 minute silent screen recording)*
```

**With**:
```markdown
## 🎥 Demo Video

**Watch Demo**: [https://youtu.be/YOUR_VIDEO_ID](https://youtu.be/YOUR_VIDEO_ID)

*2-3 minute silent screen recording showcasing NISR data integration and platform features*
```

---

## 📅 TOMORROW (Oct 9) - Final Testing

### ☐ 4. Make Repository Public

**Current Status**: Private repository  
**Action**: Go to GitHub → Settings → Change visibility to Public

**Steps**:
1. Go to https://github.com/ChristianTonny/rgi
2. Click "Settings" tab
3. Scroll to "Danger Zone"
4. Click "Change visibility"
5. Select "Make public"
6. Confirm by typing repository name

**⚠️ IMPORTANT**: Only do this AFTER you've added demo video and team info!

---

### ☐ 5. Final Smoke Test

**Test the submission package as if you were a judge**:

1. **Clone the repository** (from a clean directory):
   ```bash
   cd /tmp
   git clone https://github.com/ChristianTonny/rgi.git
   cd rgi
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start backend**:
   ```bash
   node server/index.js
   ```
   - Verify: "✅ Loaded 56 total rows from NISR datasets"
   - Verify: "✅ Loaded 72 datasets from NISR catalog"

4. **Start frontend** (new terminal):
   ```bash
   npm run dev
   ```
   - Verify: Frontend runs on port 3000 or 3002

5. **Test key workflows**:
   - ✅ Login with minister@gov.rw / password123
   - ✅ Dashboard shows NISR citations
   - ✅ Click "Generate Budget Report" → CSV downloads
   - ✅ Search works
   - ✅ Navigation between tabs works

6. **Verify README**:
   - ✅ Demo video link works (opens video)
   - ✅ Team information filled in
   - ✅ Setup instructions are accurate
   - ✅ GitHub repo URL is correct

---

## 📧 SUBMISSION DAY (Oct 10)

### ☐ 6. Email Submission

**To**: competition@statistics.gov.rw  
**Subject**: NISR 2025 Big Data Hackathon Submission - Track 5 - [Your Name/Team Name]

**Email Template**:
```
Dear NISR Big Data Hackathon Organizing Committee,

I am submitting my entry for Track 5: Open Innovation at the NISR 2025 Big Data Hackathon.

Project Title: Rwanda Government Intelligence Platform
GitHub Repository: https://github.com/ChristianTonny/rgi (Public)
Demo Video: [Your YouTube/Vimeo Link]

Brief Description (100 words):
An AI-powered decision intelligence platform that centralizes Rwanda's NISR datasets 
(poverty, labor, GDP, demographics) into an instant-access dashboard for government 
leadership. Ministers can ask questions like "What's our poverty rate in Eastern Province?" 
and get answers with NISR citations within seconds. Features include: (1) Real-time 
intelligence cards showing national statistics, (2) AI chat assistant citing NISR sources, 
(3) One-click CSV report generation, (4) Cross-ministry performance tracking. Built with 
Next.js, Express API, and integrates 72 NISR datasets from 1978-2024. Transforms 
scattered Excel files into actionable government intelligence.

Team Type: [Student Team / Fresh Graduate Individual]
Team Members:
- [Name 1] - [University/Graduate Status] - [Email] - [Phone]
- [Name 2] - [University] - [Email] - [Phone] *(if student team)*

Thank you for the opportunity to participate in this innovation challenge.

Best regards,
[Your Name]
[Phone Number]
```

---

## ✅ Pre-Submission Checklist

Before hitting "Send" on your submission email, verify:

- [ ] ✅ Repository is PUBLIC on GitHub
- [ ] ✅ Demo video link works (test in incognito window)
- [ ] ✅ README.md has team information filled in
- [ ] ✅ README.md has demo video link
- [ ] ✅ All code is committed and pushed
- [ ] ✅ No sensitive data (passwords, API keys) in code
- [ ] ✅ Smoke test passed (clone → install → run → works)
- [ ] ✅ Demo video shows NISR data integration clearly
- [ ] ✅ Email has correct recipient (competition@statistics.gov.rw)
- [ ] ✅ Email includes all required information
- [ ] ✅ Phone number provided for contact

---

## 📞 Emergency Contacts (If Issues Arise)

**Technical Issues**:
- Check `/docs/CURRENT-STATUS.md` for troubleshooting
- Check `/docs/VERIFICATION-REPORT.md` for feature verification
- Review `/docs/hackathon-strategy.md` for demo script

**Submission Questions**:
- Email: competition@statistics.gov.rw
- Check hackathon website for updates

**Repository Issues**:
- Ensure all files are committed: `git status`
- Push changes: `git push origin main` (or your branch name)
- Verify visibility: Check GitHub repo in incognito window

---

## 🎯 Success Criteria

Your submission will be successful if:

1. ✅ Repository is public and accessible
2. ✅ Demo video clearly shows NISR data integration
3. ✅ README has complete setup instructions
4. ✅ Platform runs successfully when cloned fresh
5. ✅ All required information in submission email
6. ✅ Submitted before October 10 deadline

---

## 💡 Pro Tips

**Demo Video**:
- Record in 1080p for clarity
- Use incognito window to avoid extension clutter
- Test audio OFF before recording (silent requirement)
- Do a test recording first to check quality
- Keep cursor movements smooth and intentional

**README**:
- Use your actual information (no placeholders)
- Double-check all links work
- Ensure email addresses are monitored
- Professional tone throughout

**Final Test**:
- Test on a different computer if possible
- Clear cache and cookies before testing
- Follow README instructions exactly
- Time yourself - should take 5 minutes to set up

---

**Last Updated**: October 8, 2025  
**Platform Version**: 1.0.0-hackathon  
**Estimated Time to Complete Remaining Tasks**: 2-3 hours  
**Deadline**: October 10, 2025, 11:59 PM (assumed)
