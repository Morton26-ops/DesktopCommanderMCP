#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function fail(message) {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

function resolveNpmCommand() {
  const npmExecPath = process.env.npm_execpath;

  if (npmExecPath && fs.existsSync(npmExecPath)) {
    if (path.extname(npmExecPath).toLowerCase() === '.js') {
      return { command: process.execPath, args: [npmExecPath, '--version'] };
    }

    if (process.platform === 'win32') {
      return {
        command: process.env.comspec || 'cmd.exe',
        args: ['/d', '/s', '/c', `"${npmExecPath}" --version`]
      };
    }

    return { command: npmExecPath, args: ['--version'] };
  }

  const pathEntries = (process.env.PATH || '').split(path.delimiter).filter(Boolean);

  for (const entry of pathEntries) {
    const candidate = process.platform === 'win32'
      ? path.join(entry, 'npm.cmd')
      : path.join(entry, 'npm');

    if (fs.existsSync(candidate)) {
      if (process.platform === 'win32') {
        return {
          command: process.env.comspec || 'cmd.exe',
          args: ['/d', '/s', '/c', `"${candidate}" --version`]
        };
      }

      return { command: candidate, args: ['--version'] };
    }
  }

  const nodeDir = path.dirname(process.execPath);
  const fallback = process.platform === 'win32'
    ? path.join(nodeDir, 'npm.cmd')
    : path.join(nodeDir, 'npm');

  if (fs.existsSync(fallback)) {
    if (process.platform === 'win32') {
      return {
        command: process.env.comspec || 'cmd.exe',
        args: ['/d', '/s', '/c', `"${fallback}" --version`]
      };
    }

    return { command: fallback, args: ['--version'] };
  }

  return null;
}

const currentVersion = process.versions.node;
const majorVersion = Number.parseInt(currentVersion.split('.')[0], 10);

if (!Number.isInteger(majorVersion) || majorVersion < 18) {
  fail(`Node.js 18 or newer is required. Current version: ${currentVersion}`);
}

const npmCommand = resolveNpmCommand();

if (!npmCommand) {
  fail('npm is required but could not be found. Install Node.js and ensure npm is available on PATH or next to node.exe.');
}

let npmVersion = '';

try {
  npmVersion = execFileSync(npmCommand.command, npmCommand.args, { encoding: 'utf8' }).trim();
} catch (error) {
  fail('npm is required but could not be executed. Install Node.js and restart your terminal.');
}

console.log(`✓ Node.js ${currentVersion} and npm ${npmVersion} detected.`);
