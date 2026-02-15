---
name: Stitch UI Generator
description: Generate comprehensive UI designs and React components using Google Stitch MCP.
---

# Stitch UI Generator Skill

This skill enables the agent to use Google Stitch to generate high-quality UIs, react components, and design systems.

## 🛠️ Setup & Configuration

### 1. API Key
The user has provided the follwing Stitch API Key:
`AQ.Ab8RN6J_AA5zij9XoTsJ-U3fI91lE6QFPpMLFrRfhObeIvc-Bg`

### 2. Installation
To enable this skill, the **Stitch MCP Server** must be running.

**Option A: Quick Start (npx)**
Run the following command in your terminal to initialize the server:
```bash
npx -y @_davideast/stitch-mcp init
```
Follow the interactive prompts. When asked for the API Key, use the one provided above.

**Option B: Manual MCP Configuration**
Add the following to your MCP Settings file (e.g. `claude_desktop_config.json` or `antigravity_config.json`):

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": [
        "-y",
        "@_davideast/stitch-mcp"
      ],
      "env": {
        "STITCH_API_KEY": "AQ.Ab8RN6J_AA5zij9XoTsJ-U3fI91lE6QFPpMLFrRfhObeIvc-Bg"
      }
    }
  }
}
```

## 🧠 Capabilities
Once connected, the Stitch MCP server provides tools to:
1.  **Generate UI**: Create screens based on text descriptions.
2.  **Edit UI**: Modify existing designs.
3.  **Export Code**: Convert designs into React/Tailwind code.

## 📝 Usage Instructions (For Agent)
- When the user asks for a UI design, consider using the `stitch` tools if available.
- If tools are not detected, remind the user to run the setup command.
- When generating code, ensure it aligns with the project's existing Design System (Tailwind CSS, clean aesthetics).
- **Pro Tip**: Use "best seller carousel" or "modern mobile nav" as prompts to Stitch to get optimized results.
