#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

spawnSync('yarn', ['r', 'bridgeflow.ts', ...process.argv.slice(2)], {
  stdio: 'inherit',
});
