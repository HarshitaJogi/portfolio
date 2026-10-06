#!/bin/sh
# Re-render the resume preview shown on the back of the name card.
# Run after replacing public/Harshita_Jogi_Resume.pdf (macOS: uses the built-in sips).
set -e
cd "$(dirname "$0")/.."
sips -s format png --resampleWidth 1400 public/Harshita_Jogi_Resume.pdf --out public/media/resume-preview.png >/dev/null
python3 -c "from PIL import Image; im=Image.open('public/media/resume-preview.png').convert('RGB'); im.quantize(colors=48, dither=Image.Dither.NONE).save('public/media/resume-preview.png', optimize=True)" 2>/dev/null || true
echo "public/media/resume-preview.png updated"
