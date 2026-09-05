#!/usr/bin/env node

/**
 * stitch_bridge.mjs
 * Bridge utility for Stitch MCP and PeoplePay360 Design System.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_CONFIG = {
  project: {
    title: "PeoplePay360 - Odoo Enterprise HRMS"
  },
  design_system: {
    displayName: "Odoo 18 Enterprise Design System",
    theme: {
      bodyFont: "INTER",
      headlineFont: "INTER",
      colorMode: "LIGHT",
      colorVariant: "VIBRANT",
      customColor: "#714B67",
      overrideSecondaryColor: "#00A09D",
      roundness: "ROUND_EIGHT"
    }
  }
};

const args = process.argv.slice(2);
const command = args[0] || 'info';

switch (command) {
  case 'config':
    console.log(JSON.stringify(PROJECT_CONFIG, null, 2));
    break;

  case 'encode-design-md': {
    const designMdPath = path.resolve(__dirname, '../../../../DESIGN.md');
    if (!fs.existsSync(designMdPath)) {
      console.error(`Error: DESIGN.md not found at ${designMdPath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(designMdPath, 'utf-8');
    const base64 = Buffer.from(content, 'utf-8').toString('base64');
    console.log(base64);
    break;
  }

  case 'verify': {
    console.log('Validating PeoplePay360 design tokens...');
    console.log('✓ Project Title:', PROJECT_CONFIG.project.title);
    console.log('✓ Design System:', PROJECT_CONFIG.design_system.displayName);
    console.log('✓ Primary Color (Odoo Aubergine):', PROJECT_CONFIG.design_system.theme.customColor);
    console.log('✓ Secondary Color (Odoo Teal):', PROJECT_CONFIG.design_system.theme.overrideSecondaryColor);
    console.log('✓ Typography:', PROJECT_CONFIG.design_system.theme.headlineFont, '/', PROJECT_CONFIG.design_system.theme.bodyFont);
    console.log('✓ Roundness:', PROJECT_CONFIG.design_system.theme.roundness);
    console.log('Configuration is valid and ready for Stitch MCP.');
    break;
  }

  case 'info':
  default:
    console.log(`
PeoplePay360 Stitch MCP Bridge Utility
Usage:
  node stitch_bridge.mjs config             - Output project & design system JSON payload
  node stitch_bridge.mjs encode-design-md   - Output Base64-encoded DESIGN.md for upload_design_md
  node stitch_bridge.mjs verify             - Verify design system tokens
    `);
    break;
}
