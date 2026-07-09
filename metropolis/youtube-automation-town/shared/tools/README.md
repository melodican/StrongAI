# Dossier → Shorts machine

Free, offline pipeline that turns a long-form dossier into vertical 9:16
YouTube Shorts — blurred-fill background, bold red HOOK banner, burned-in
captions, and a "Full dossier on the channel" CTA. No paid tools, no
watermark, no upload limits.

## What it uses (all free)
- **yt-dlp** — pulls the source video (or point it at a local `.mp4`)
- **ffmpeg** — the crop, blur-fill, banner, CTA, encode
- **openai-whisper** *(optional)* — auto-captions, runs locally, no API cost

## One-time install

**macOS:**
```bash
brew install ffmpeg yt-dlp
pip3 install -U openai-whisper        # optional, for captions
```

**Windows:** install ffmpeg + yt-dlp (winget or the official builds), then
`pip install -U openai-whisper` for captions. Run the script from Git Bash / WSL.

## Run it

```bash
# from a YouTube URL:
./dossier-to-shorts.sh "https://youtu.be/RtPcip0TABg" cutlist-batch1.tsv shorts_out

# or from a local file you already have:
./dossier-to-shorts.sh /path/to/dossier.mp4 cutlist-batch1.tsv shorts_out

# no captions (fastest, banner + CTA still burn in):
CAPTIONS=none ./dossier-to-shorts.sh <source> cutlist-batch1.tsv shorts_out
```

Finished Shorts land in `shorts_out/` as `<OUTNAME>.mp4`, ready to upload.

## The cutlist

`cutlist-batch1.tsv` is TAB-separated, one Short per line:

```
START   END     BANNER              OUTNAME
00:02:14 00:02:51  THEY ATE THIS?    rations-hook
```

- Each Short is cut from **one** source video, so run the script **once per
  source video** and keep only that video's rows in the cutlist.
- Find START/END by scrubbing the source for the hook moment (aim 30–50s).
- `#` lines are ignored.

## Tunables (env vars)

| Var | Default | Notes |
|-----|---------|-------|
| `CAPTIONS` | `whisper` | `whisper` or `none` |
| `WHISPER_MODEL` | `base` | `tiny`/`base`/`small`/`medium` — bigger = slower, more accurate |
| `CTA_TEXT` | `Full dossier on the channel` | bottom card text |
| `BG_BLUR` | `22:4` | background blur strength |
| `FONT` / `BANNER_FONT` | auto-detected bold | override with a `.ttf` path |
| `FPS` | `30` | output frame rate |

## Every Short's YouTube caption
```
Full dossier on the channel 🫡 #ww2 #history #worldwar2 #militaryhistory #wwii
```

## Notes
- Verified end-to-end: outputs are true 1080×1920, segment-accurate.
- `-nostdin` is set on ffmpeg so it doesn't swallow the cutlist mid-run.
- This is the seed of the automated Shorts stage — Oracle/Artisan can call
  this same script in the render pipeline once a dossier finishes rendering.
