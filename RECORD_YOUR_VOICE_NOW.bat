@echo off
title Praman Desk - record your 30 sec voice
start https://praman-desk.vercel.app
notepad "%~dp0public\audio\VOICEOVER_SCRIPT_30SEC.txt"
notepad "%~dp0docs\RECORD_30SEC_HUMAN_VOICE.md"
echo.
echo 1. Press Windows+G to open Game Bar, then Record.
echo 2. On the site, click Scenario 7, read the script aloud.
echo 3. Stop recording. Copy clip to:
echo    public\audio\user_voice_screen_record.mp4
echo 4. Run: npm run video:mux-user
echo.
pause