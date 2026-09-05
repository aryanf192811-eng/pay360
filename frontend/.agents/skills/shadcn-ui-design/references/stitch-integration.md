# Stitch MCP Integration Guide

This guide describes how the Antigravity agent and developers interact with **Stitch MCP** for AI-assisted UI design, screen prototyping, and design system sync.

---

## 1. What is Stitch MCP?

Stitch MCP is Google's UI prototyping MCP server. It enables:
- Creating design projects (`create_project`).
- Establishing design systems with custom tokens, fonts, and roundness (`create_design_system`, `create_design_system_from_design_md`).
- Generating interactive screen layouts from plain English prompts (`generate_screen_from_text`).
- Iterating on screen layouts and generating component variants (`edit_screens`, `generate_variants`).
- Syncing design guidelines from a canonical `DESIGN.md` file (`upload_design_md`).

---

## 2. Tool Reference

| Tool Name | Key Parameters | Purpose |
| :--- | :--- | :--- |
| `create_project` | `title` (string) | Initializes a container project for screens and design assets. |
| `create_design_system` | `projectId`, `designSystem: { displayName, theme }` | Creates design tokens: primary color (`customColor`), secondary (`overrideSecondaryColor`), fonts, roundness. |
| `upload_design_md` | `projectId`, `designMdBase64` | Uploads a complete markdown design specification file encoded in Base64. |
| `create_design_system_from_design_md` | `projectId` | Parses uploaded `DESIGN.md` and generates design tokens automatically. |
| `generate_screen_from_text` | `projectId`, `prompt`, `deviceType` | Synthesizes an interactive screen from a text description using the project's design system. |
| `list_projects` | None | Lists available projects. |
| `list_screens` | `projectId` | Returns all screens generated within a project. |
| `get_screen` | `screenId`, `projectId` | Retrieves screen details, layout hierarchy, and code components. |

---

## 3. Project Configuration for PeoplePay360

When calling Stitch MCP tools for this project, always use the agreed-upon design configuration:

```json
{
  "project": {
    "title": "PeoplePay360 - Odoo Enterprise HRMS"
  },
  "design_system": {
    "displayName": "Odoo 18 Enterprise Design System",
    "theme": {
      "headlineFont": "INTER",
      "bodyFont": "INTER",
      "colorMode": "LIGHT",
      "colorVariant": "VIBRANT",
      "customColor": "#714B67",
      "overrideSecondaryColor": "#00A09D",
      "roundness": "ROUND_EIGHT"
    }
  }
}
```

---

## 4. Automation Bridge Script (`scripts/stitch_bridge.mjs`)

A helper script is provided in `scripts/stitch_bridge.mjs` to validate tokens, prepare base64 payloads for `upload_design_md`, and test direct connections to Stitch MCP.

Run it using Node.js:
```bash
node .agents/skills/shadcn-ui-design/scripts/stitch_bridge.mjs --help
```
