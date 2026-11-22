import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const lockFilePath = path.join(rootDir, 'evidence', 'session-sentinel-lock.json');

export function getLockState() {
  try {
    if (fs.existsSync(lockFilePath)) {
      return JSON.parse(fs.readFileSync(lockFilePath, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading lock file:', err.message);
  }
  return {
    locked: false,
    active_task: null,
    started_at: null,
    pending_cron: false,
    last_cron_run: null
  };
}

export function saveLockState(state) {
  try {
    const dir = path.dirname(lockFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(lockFilePath, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving lock file:', err.message);
  }
}

export function acquireLock(taskName = 'Active Manual Task') {
  const state = getLockState();
  state.locked = true;
  state.active_task = taskName;
  state.started_at = new Date().toISOString();
  saveLockState(state);
  console.log(`[SentinelLock] ACQUIRED by '${taskName}'. Background cron will defer until completion.`);
  return state;
}

export function releaseLock() {
  const state = getLockState();
  const hadPending = state.pending_cron;
  state.locked = false;
  state.active_task = null;
  state.pending_cron = false;
  saveLockState(state);
  console.log(`[SentinelLock] RELEASED. Pending cron status: ${hadPending}`);
  return { state, hadPending };
}

export function checkCronPermission() {
  const state = getLockState();
  if (state.locked) {
    state.pending_cron = true;
    saveLockState(state);
    console.log(`[SentinelLock] DEFERRED: Active task '${state.active_task}' is in progress. Cron queued for post-task execution.`);
    return { canExecute: false, reason: `Active task '${state.active_task}' is in progress` };
  }
  return { canExecute: true, reason: 'Session is idle' };
}

export function recordCronExecution() {
  const state = getLockState();
  state.last_cron_run = new Date().toISOString();
  state.pending_cron = false;
  saveLockState(state);
}

// CLI usage support
if (process.argv[1] && process.argv[1].endsWith('sentinel-lock.mjs')) {
  const command = process.argv[2];
  const arg = process.argv[3];
  if (command === 'acquire') {
    acquireLock(arg || 'Manual Task');
  } else if (command === 'release') {
    releaseLock();
  } else if (command === 'check') {
    const res = checkCronPermission();
    console.log(JSON.stringify(res));
  } else if (command === 'status') {
    console.log(JSON.stringify(getLockState(), null, 2));
  } else {
    console.log('Usage: node sentinel-lock.mjs [acquire <name>|release|check|status]');
  }
}
