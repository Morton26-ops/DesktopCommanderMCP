#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = process.cwd();

function runIfExists(relativePath) {
  const fullPath = path.resolve(root, relativePath);

  if (!fs.existsSync(fullPath)) {
    return;
  }

  spawnSync(process.execPath, [fullPath], {
    stdio: 'inherit'
  });
}

runIfExists('dist/track-installation.js');
runIfExists('dist/npm-scripts/verify-ripgrep.js');
