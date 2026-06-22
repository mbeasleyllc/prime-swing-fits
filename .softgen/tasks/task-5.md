---
title: Results, Report & PDF Export
status: todo
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
- [ ] Create /fitting/[id]/results page with recommendations display
- [ ] Show matched products with affiliate links
- [ ] Display advisory notes callout box
- [ ] Add collapsible accordion for input summary
- [ ] Create /fitting/[id]/report print-optimized page
- [ ] Implement window.print() for print button
- [ ] Install html2canvas and jsPDF packages
- [ ] Create PDF download function with canvas capture
- [ ] Upload generated PDF to Supabase Storage
- [ ] Format filename as ProSwing-Fitting-Report-YYYY-MM-DD.pdf

## Acceptance
- Results page shows all recommendations clearly
- Print button opens native print dialog
- PDF downloads with correct formatting and filename