#!/usr/bin/env node
// Install script that filters deprecation warnings
const { execSync } = require('child_process');
const { spawn } = require('child_process');

const child = spawn('npm', ['ci', '--no-audit', '--no-fund', '--prefer-offline'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

child.stdout.on('data', (data) => {
  const output = data.toString();
  if (!output.includes('deprecated')) {
    process.stdout.write(output);
  }
});

child.stderr.on('data', (data) => {
  const output = data.toString();
  if (!output.includes('deprecated')) {
    process.stderr.write(output);
  }
});

child.on('close', (code) => {
  process.exit(code);
});

