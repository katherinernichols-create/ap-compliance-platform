# KORA Branding Guidelines for Developers

**Last Updated:** 1 December 2025  
**Applies to:** All new components and pages

---

## Overview

We've implemented KORA brand tokens in `tailwind.config.js`. All future development **must** use these custom classes instead of generic Tailwind colors.

---

## 🎨 Color Reference

### Primary Colors

| Usage | Class | Hex | Example |
|-------|-------|-----|---------|
| Primary actions (buttons, CTAs) | `bg-kora-coral` | #E06060 | Submit buttons, Add actions |
| Secondary/Info | `bg-kora-teal` | #20A080 | Success states, info badges |
| Deep accents | `bg-kora-deep-teal` | #004040 | Headings, navigation |
| Mid accents | `bg-kora-mid-teal` | #208080 | Hover states, links |

### Semantic Colors

| Status | Class | Usage |
|--------|-------|-------|
| Success/Compliant | `bg-kora-success` or `bg-kora-teal` | Compliant status badges |
| Warning/At Risk | `bg-kora-warning` | #E0A040 - Expiring soon badges |
| Error/Non-compliant | `bg-kora-error` or `bg-kora-coral` | Failed validations, expired credentials |
| Info | `bg-kora-info` or `bg-kora-mid-teal` | Information boxes |

### Neutrals

| Usage | Class | Hex |
|-------|-------|-----|
| Text | `text-kora-black` | #1A1A1A |
| Borders | `border-kora-grey` | #E0E0E0 |
| Backgrounds | `bg-kora-white` | #FFFFFF |

---

## 📐 Spacing & Layout Tokens

### Border Radius

rounded-kora-sm /* 4px - small elements /
rounded-kora-md / 6px - buttons, inputs /
rounded-kora-lg / 8px - cards, containers /
rounded-kora-xl / 12px - badges, chips *
### Box Shadow

shadow-kora-sm /* Buttons, subtle elevation /
shadow-kora-md / Cards, panels /
shadow-kora-lg / Modals, overlays */

### Spacing

Standard increments: `2, 4, 8, 12, 16, 24, 32` (use as `p-4`, `m-8`, etc.)

---

## 🧩 Component Patterns

### Primary Button

<button className="bg-kora-coral text-kora-white px-6 py-2 rounded-kora-md hover:bg-[#CC5454] shadow-kora-sm font-medium"> Add Worker </button> ```

Secondary Button
<button className="bg-kora-grey text-kora-black px-6 py-2 rounded-kora-md hover:bg-gray-300">
  Cancel
</button>

Status Badge (Traffic Light)
<span className={`px-3 py-1 rounded-kora-xl text-xs font-medium ${
  status === 'compliant' 
    ? 'bg-kora-teal text-kora-white'
    : status === 'at_risk'
    ? 'bg-kora-warning text-kora-white'
    : 'bg-kora-error text-kora-white'
}`}>
  {status}
</span>

Card Container
<div className="bg-white rounded-kora-lg shadow-kora-md p-6">
  <h2 className="text-lg font-bold text-kora-deep-teal mb-4">Card Title</h2>
  <p className="text-sm text-gray-600">Card content...</p>
</div>

Info/Alert Box
{/* Teal info box */}
<div className="bg-kora-teal/10 rounded-kora-md border border-kora-teal/20 p-4">
  <p className="text-sm text-kora-deep-teal">Helpful information here</p>
</div>

{/* Error box */}
<div className="bg-kora-error/10 rounded-kora-md border border-kora-error/20 p-4">
  <p className="text-sm text-kora-error">Error message here</p>
</div>

Form Input
<input
  type="text"
  className="w-full px-3 py-2 border border-kora-grey rounded-kora-md focus:ring-2 focus:ring-kora-teal focus:border-kora-teal"
/>

<Link href="/workers" className="text-kora-teal hover:text-kora-mid-teal font-medium">
  ← Back to Workers
</Link>

Page Heading
<h1 className="text-xl font-bold text-kora-deep-teal mb-6">
  Page Title
</h1>

❌ Migration Guide - What NOT to Use
Old (Generic Tailwind)	New (KORA Branded)
bg-blue-600	bg-kora-coral
bg-green-100	bg-kora-teal/10
bg-red-100	bg-kora-error/10
text-blue-600	text-kora-teal
text-gray-900	text-kora-deep-teal or text-kora-black
border-gray-300	border-kora-grey
rounded	rounded-kora-md
rounded-full	rounded-kora-xl (for badges)
shadow	shadow-kora-sm or shadow-kora-md
🔍 Reference Examples
Fully branded pages you can reference:

app/workers/page.tsx - List page with table, buttons, badges

app/workers/new/page.tsx - Form with inputs, buttons, info boxes

app/workers/[id]/page.tsx - Detail page with cards, status badges

app/dashboard/page.tsx - Dashboard with stats cards

app/login/page.tsx - Login form with logo, inputs, error states

✅ Pre-commit Checklist
Before pushing new components, verify:

 Primary buttons use bg-kora-coral (not blue)

 Headings use text-kora-deep-teal (not gray-900)

 Links use text-kora-teal hover:text-kora-mid-teal

 Status badges use semantic KORA colors (teal/warning/error)

 Border radius uses rounded-kora-* (not generic rounded)

 Shadows use shadow-kora-* (not generic shadow)

 Cards use rounded-kora-lg shadow-kora-md

 Form inputs have focus:ring-kora-teal states

🎨 Design System Source
All KORA tokens are defined in: tailwind.config.js

// Core brand colours
kora: {
  coral: "#E06060",
  teal: "#20A080",
  "deep-teal": "#004040",
  "mid-teal": "#208080",
}
For full token definitions, see lines 7-50 in tailwind.config.js.

📝 Typography
Font stack: Inter, Roboto, system-ui, sans-serif (already configured)

Font sizes:

text-xs - 12px (badges, captions)

text-sm - 14px (body text, labels)

text-base - 16px (default)

text-lg - 20px (subheadings)

text-xl - 28px (page titles)

🚀 Quick Start Template
'use client'

export default function NewPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-kora-deep-teal mb-6">
          Page Title
        </h1>

        <div className="bg-white rounded-kora-lg shadow-kora-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-kora-deep-teal mb-4">
            Section Title
          </h2>
          
          <p className="text-sm text-gray-600 mb-4">
            Content goes here
          </p>

          <button className="bg-kora-coral text-kora-white px-6 py-2 rounded-kora-md hover:bg-[#CC5454] shadow-kora-sm">
            Primary Action
          </button>
        </div>
      </div>
    </div>
  )
}

