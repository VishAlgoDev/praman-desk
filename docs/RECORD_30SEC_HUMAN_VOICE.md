# Optional: record your own voice (not required)

**Default policy:** use `praman-desk-walkthrough.mp4` only — see `docs/VIDEO_PRODUCTION_STANDARD.md`.  
This doc is optional polish if you prefer a human narrator over edge-tts.

## What you need

- Windows PC
- Microphone (laptop mic is fine)
- 5 minutes

## Steps

1. Open **https://praman-desk.vercel.app** in Chrome or Edge (full screen helps).

2. Open the script to read: `public/audio/VOICEOVER_SCRIPT_30SEC.txt` (on this PC in the project folder, or copy from GitHub).

3. **Start recording screen + your voice**
   - Press **Windows key + G** (Xbox Game Bar)
   - Click **Capture** → **Record** (or the record button)
   - If it asks for mic permission, allow it

4. **While recording:**
   - Click **Scenario 7** (Two-Mind Spend Guard) on the dashboard
   - Wait until you see the **red blocked payment** banner
   - Read the script slowly (see `VOICEOVER_SCRIPT_30SEC.txt`)

5. **Stop recording** (Win+G → Stop).  
   Clips save under **Videos → Captures** (usually `C:\Users\<you>\Videos\Captures\`).

6. **Send the file to the agent** (or put a copy here):
   - Rename/move your clip to:  
     `c:\Users\Public\My Agent\telegraph-h2\public\audio\user_voice_screen_record.mp4`  
   - Then tell the agent: **"mux my voice video"**  
   - Or run: `npm run video:mux-user`

The agent will convert it to `public/praman_minds_benchmark_showcase.mp4`, deploy to Vercel, and the old robot short link will show **your** recording.

## What judges should use until then

**Official demo (already good):**  
https://praman-desk.vercel.app/praman-desk-walkthrough.mp4

The short URL is only a **clip from that walkthrough** until your human recording replaces it.