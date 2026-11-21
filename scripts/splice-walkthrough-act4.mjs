/**
 * Replaces walkthrough video track [act4Start, act4End) with act4_patch.mp4; keeps Prabhat audio.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const MASTER = path.join('public', 'praman-desk-walkthrough.mp4');
const PATCH = path.join('public', 'recorded_act4_patch', 'act4_patch.mp4');
const TIMELINE = path.join('public', 'audio', 'prabhat', 'timeline.json');
const WORK = path.join('public', 'recorded_act4_patch', 'splice_work');
const OUT = path.join('public', 'praman-desk-walkthrough_spliced.mp4');

if (!fs.existsSync(MASTER)) {
  console.error('Missing master:', MASTER);
  process.exit(1);
}
if (!fs.existsSync(PATCH)) {
  console.error('Missing patch. Run: node scripts/record-act4-two-minds-patch.mjs');
  process.exit(1);
}

const timeline = JSON.parse(fs.readFileSync(TIMELINE, 'utf8'));
const act4 = timeline.acts.find((a) => a.act === 'act_4_two_minds');
if (!act4) {
  console.error('No act_4_two_minds in timeline');
  process.exit(1);
}

const act4Start = act4.start;
const act4End = act4.end;
const patchDur = parseFloat(
  execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${PATCH}"`
  )
    .toString()
    .trim()
);

console.log(`Splice: replace video ${act4Start}s–${act4End}s (${(act4End - act4Start).toFixed(2)}s) with patch (${patchDur.toFixed(2)}s)`);

if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(WORK, { recursive: true });

const headMp4 = path.join(WORK, 'head.mp4');
const tailMp4 = path.join(WORK, 'tail.mp4');
const vlist = path.join(WORK, 'vconcat.txt');
const mergedV = path.join(WORK, 'merged_v.mp4');

execSync(
  `ffmpeg -y -i "${MASTER}" -t ${act4Start} -c:v libx264 -crf 19 -preset fast -pix_fmt yuv420p -an "${headMp4}"`,
  { stdio: 'inherit', shell: 'cmd.exe' }
);
execSync(
  `ffmpeg -y -ss ${act4End} -i "${MASTER}" -c:v libx264 -crf 19 -preset fast -pix_fmt yuv420p -an "${tailMp4}"`,
  { stdio: 'inherit', shell: 'cmd.exe' }
);

const toConcatPath = (p) => `file '${path.resolve(p).replace(/\\/g, '/')}'`;
fs.writeFileSync(vlist, [headMp4, PATCH, tailMp4].map(toConcatPath).join('\n'));

execSync(
  `ffmpeg -y -f concat -safe 0 -i "${vlist}" -c:v libx264 -crf 19 -preset fast -pix_fmt yuv420p -an "${mergedV}"`,
  { stdio: 'inherit', shell: 'cmd.exe' }
);

execSync(
  [
    'ffmpeg -y',
    `-i "${mergedV}"`,
    `-i "${MASTER}"`,
    '-map 0:v:0',
    '-map 1:a:0',
    '-c:v copy',
    '-c:a aac -b:a 192k',
    '-shortest',
    '-movflags +faststart',
    `"${OUT}"`,
  ].join(' '),
  { stdio: 'inherit', shell: 'cmd.exe' }
);

fs.copyFileSync(OUT, MASTER);
console.log('Updated master:', MASTER);

// Audit frame at Scenario 7 beat (~12s into act 4 after splice)
const auditT = Math.round(act4Start + 12);
const auditP = path.join('public', `clean_frame_${auditT}s_act4.png`);
execSync(`ffmpeg -y -ss ${auditT} -i "${MASTER}" -vframes 1 "${auditP}"`, { stdio: 'ignore', shell: 'cmd.exe' });
console.log('Audit frame:', auditP);