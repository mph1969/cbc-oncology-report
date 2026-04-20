# OncologyReport

Live CBC oncology tracking dashboard for Michael Patrick Hanson.

**Live site:** https://mph1969.github.io/cbc-oncology-report/
**Repo:** https://github.com/mph1969/cbc-oncology-report

---

## Quick Start

### Add a new blood draw

```bash
# 1. Copy images to images\ folder (naming: YYYYMMDD-N.jpeg)

# 2. Scaffold the DATA entry
node scripts/new-draw.js

# 3. Edit index.html and labs.html with actual values

# 4. Validate — must pass before pushing
node scripts/validate.js

# 5. Push to GitHub
scripts\push.bat "Add Apr 28 C5D7 draw"
```

### Links to share

| Audience | Link |
|----------|------|
| Dr. Liu | `?view=doctor` |
| Dr. Wen | `?view=doctor&lang=zh` |
| Family (EN) | `?view=family` |
| Family (中文) | `?view=family&lang=zh` |
| Subscribe (doctors) | `/labs.html` |

---

## File Structure

```
index.html       Main dashboard (all 3 audience views)
labs.html        Doctor notification / subscribe page
images\          Blood draw screenshots (YYYYMMDD-N.jpeg)
scripts\
  validate.js    Run before every push
  new-draw.js    Scaffold new DATA entry
  push.bat       Validate + git commit + push
CLAUDE.md        Full Claude Code instructions
```

## Claude Code

Open this folder in Claude Code for AI-assisted updates:

```bash
cd D:\Projects\OncologyReport
claude
```

Claude Code will read `CLAUDE.md` automatically and understand the full context,
data structure, cycle schedule, and update workflow.

---

*Treatment: CapeOX · 8 cycles · Started Jan 19, 2026*
