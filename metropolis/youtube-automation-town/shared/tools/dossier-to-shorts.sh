#!/usr/bin/env bash
#
# dossier-to-shorts.sh — free, offline Dossier -> YouTube Shorts cutter
# ---------------------------------------------------------------------
# Turns a long-form video (YouTube URL or local file) into vertical 9:16
# Shorts with a blurred-fill background, a bold top HOOK banner, burned-in
# captions, and an end CTA card. 100% free tools: yt-dlp + ffmpeg (+ optional
# openai-whisper for captions). No paid API, no watermark, no upload limits.
#
# USAGE:
#   ./dossier-to-shorts.sh <SOURCE> <CUTLIST.tsv> [OUTDIR]
#
#   <SOURCE>       A YouTube URL (https://youtu.be/XXXX) or a local .mp4 path.
#   <CUTLIST.tsv>  Tab-separated, one Short per line:
#                     START <TAB> END <TAB> BANNER <TAB> OUTNAME
#                  START/END accept SS, MM:SS or HH:MM:SS. Lines beginning
#                  with # are ignored. Example row:
#                     00:02:14	00:02:51	THEY ATE THIS?	rations-hook
#   [OUTDIR]       Where finished Shorts land. Default: ./shorts_out
#
# CAPTIONS: set CAPTIONS=whisper (default, needs `pip install openai-whisper`)
#           or CAPTIONS=none to skip auto-captions (banner + CTA still burn in).
#
# TUNABLES (env vars): CAPTIONS, WHISPER_MODEL, FONT, BANNER_FONT, CTA_TEXT,
#                      BG_BLUR, FPS.
#
set -euo pipefail

# ----------------------------- config ---------------------------------------
SRC="${1:?Usage: dossier-to-shorts.sh <SOURCE> <CUTLIST.tsv> [OUTDIR]}"
CUTLIST="${2:?Missing cutlist.tsv}"
OUTDIR="${3:-./shorts_out}"

CAPTIONS="${CAPTIONS:-whisper}"          # whisper | none
WHISPER_MODEL="${WHISPER_MODEL:-base}"   # tiny|base|small|medium (bigger=slower/better)
CTA_TEXT="${CTA_TEXT:-Full dossier on the channel}"
BG_BLUR="${BG_BLUR:-22:4}"
FPS="${FPS:-30}"

# Pick a bold font that exists on most Linux/macOS boxes; override with FONT=...
_default_font() {
  for f in \
    /usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf \
    /usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf \
    /Library/Fonts/Arial\ Bold.ttf \
    /System/Library/Fonts/Supplemental/Arial\ Bold.ttf ; do
    [ -f "$f" ] && { echo "$f"; return; }
  done
  fc-list : file 2>/dev/null | sed 's/: *$//' | grep -i bold | head -1
}
FONT="${FONT:-$(_default_font)}"
BANNER_FONT="${BANNER_FONT:-$FONT}"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$OUTDIR"

echo ">> font:      $FONT"
echo ">> captions:  $CAPTIONS"
echo ">> outdir:    $OUTDIR"

# ------------------------- 1. get the source video --------------------------
if [[ "$SRC" =~ ^https?:// ]]; then
  echo ">> downloading source with yt-dlp ..."
  yt-dlp -q --no-warnings \
    -f "bv*[ext=mp4][height<=1080]+ba[ext=m4a]/b[ext=mp4]/b" \
    -o "$WORK/source.%(ext)s" "$SRC"
  FULL="$(ls "$WORK"/source.* | head -1)"
else
  FULL="$SRC"
fi
[ -f "$FULL" ] || { echo "!! source video not found: $FULL" >&2; exit 1; }
echo ">> source ready: $FULL"

# --------------------------- helpers ----------------------------------------
esc() { sed -e "s/\\\\/\\\\\\\\/g" -e "s/:/\\\\:/g" -e "s/'/\\\\\\\\'/g"; }  # escape for ffmpeg filter text

make_short() {
  local start="$1" end="$2" banner="$3" name="$4"
  local clip="$WORK/${name}.clip.mp4"
  local out="$OUTDIR/${name}.mp4"
  echo ">> [$name] cutting $start -> $end   banner='$banner'"

  # 1. extract the segment, re-encoded so timestamps reset to 0
  ffmpeg -nostdin -y -loglevel error -ss "$start" -to "$end" -i "$FULL" \
    -c:v libx264 -preset veryfast -crf 20 -c:a aac -ac 2 \
    -avoid_negative_ts make_zero "$clip"

  # 2. optional captions -> segment-relative .srt
  local subs_filter=""
  if [ "$CAPTIONS" = "whisper" ]; then
    if command -v whisper >/dev/null 2>&1; then
      echo "   .. whisper captions ($WHISPER_MODEL)"
      whisper "$clip" --model "$WHISPER_MODEL" --language en \
        --output_format srt --output_dir "$WORK" >/dev/null 2>&1 || true
      local srt="$WORK/${name}.clip.srt"
      if [ -f "$srt" ]; then
        local srt_esc; srt_esc="$(printf '%s' "$srt" | esc)"
        subs_filter=",subtitles='${srt_esc}':force_style='Fontname=DejaVu Sans,Bold=1,FontSize=15,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=3,Shadow=1,Alignment=2,MarginV=90'"
      fi
    else
      echo "   !! whisper not installed (pip install openai-whisper); skipping captions"
    fi
  fi

  # 3. compose 9:16 blur-fill + banner + CTA end card, burn captions
  local btext; btext="$(printf '%s' "$banner" | esc)"
  local ctext; ctext="$(printf '%s' "$CTA_TEXT" | esc)"

  ffmpeg -nostdin -y -loglevel error -i "$clip" -filter_complex "
    [0:v]fps=${FPS},split=2[bg][fg];
    [bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=${BG_BLUR}[bgb];
    [fg]scale=1080:-2[fgs];
    [bgb][fgs]overlay=(W-w)/2:(H-h)/2[v];
    [v]drawbox=x=0:y=150:w=1080:h=150:color=red@0.85:t=fill[vb];
    [vb]drawtext=fontfile='${BANNER_FONT}':text='${btext}':fontcolor=white:fontsize=68:borderw=4:bordercolor=black:x=(w-text_w)/2:y=195[vt];
    [vt]drawtext=fontfile='${FONT}':text='${ctext}':fontcolor=white:fontsize=44:borderw=4:bordercolor=black:box=1:boxcolor=black@0.55:boxborderw=22:x=(w-text_w)/2:y=h-260[vc]${subs_filter}
  " -map "[vc]" -map "0:a?" -c:v libx264 -preset veryfast -crf 20 \
    -c:a aac -b:a 128k -movflags +faststart -r "$FPS" "$out"
  echo ">> [$name] done -> $out"
}

# --------------------------- 4. run the cutlist -----------------------------
n=0
while IFS=$'\t' read -r start end banner name || [ -n "$start" ]; do
  [[ -z "${start// }" || "$start" =~ ^[[:space:]]*# ]] && continue
  name="${name:-short_$((n+1))}"
  make_short "$start" "$end" "$banner" "$name"
  n=$((n+1))
done < "$CUTLIST"

echo ">> ALL DONE: $n short(s) in $OUTDIR"
