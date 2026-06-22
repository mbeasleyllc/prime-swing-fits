---
title: Results, Report & PDF Export
status: done
priority: medium
type: feature
tags: [results, pdf, export]
created_by: agent
created_at: 2026-06-22T19:04:45Z
position: 5
---

## Notes
Build results display page, printable report page, and PDF export using html2canvas + jsPDF.

## Checklist
- [x] Create /fitting/[id]/results page with recommendations display
- [x] Show personalized recommendations in highlighted card
- [x] Display advisory notes with warning callouts
- [x] Query and display matched products (up to 3)
- [x] Add collapsible accordion for all input data
- [x] Create /fitting/[id]/report page with print-optimized layout
- [x] Implement print button (window.print)
- [x] Implement PDF download with html2canvas + jsPDF
- [x] Apply @media print styles to hide nav/buttons
- [x] Save PDF to Supabase Storage /reports/[user_id]/[session_id].pdf

## Acceptance
- Results page shows all recommendations clearly
- Print button opens native print dialog
- PDF downloads with correct formatting and filename