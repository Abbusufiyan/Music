#!/usr/bin/env python3
import os, json, shutil, re, subprocess, sys

SOURCE_ROOT = '/home/omr/Music/songs'
DEST_ROOT = '/home/omr/Desktop/music-app/music-assets'
SONGS_DIR = os.path.join(DEST_ROOT, 'songs')
IMAGES_DIR = os.path.join(DEST_ROOT, 'images')
LYRICS_DIR = os.path.join(DEST_ROOT, 'lyrics')
DOC_DIR = os.path.join(DEST_ROOT, 'documentation')

# Ensure dest subdirs exist
for d in [SONGS_DIR, IMAGES_DIR, LYRICS_DIR, DOC_DIR]:
    os.makedirs(d, exist_ok=True)

entries = []
slug_set = set()

def slugify(name):
    # lower, remove non-alphanumeric (keep spaces), replace spaces with hyphens, strip hyphens
    name = name.lower()
    name = re.sub(r"[^a-z0-9\s-]", "", name)
    name = re.sub(r"\s+", "-", name.strip())
    # ensure unique
    base = name
    i = 1
    while name in slug_set:
        name = f"{base}-{i}"
        i += 1
    slug_set.add(name)
    return name

# Walk through files
for root, dirs, files in os.walk(SOURCE_ROOT):
    for f in files:
        if not f.lower().endswith('.mp3'):
            continue
        orig_path = os.path.join(root, f)
        size_bytes = os.path.getsize(orig_path)
        # Try to extract title/artist via ffprobe; fallback to filename parsing
        try:
            ffprobe_cmd = ["ffprobe", "-v", "error", "-show_entries", "format_tags=title,artist,album", "-of", "default=noprint_wrappers=1:nokey=1", orig_path]
            result = subprocess.check_output(ffprobe_cmd, stderr=subprocess.DEVNULL).decode('utf-8').split('\n')
            # ffprobe output may be title,artist,album each on separate lines (or missing)
            title = result[0].strip() if len(result) > 0 and result[0].strip() else None
            artist = result[1].strip() if len(result) > 1 and result[1].strip() else None
            album = result[2].strip() if len(result) > 2 and result[2].strip() else None
        except Exception:
            title = artist = album = None
        # Fallback parsing filename: remove leading numbers and dot
        if not title:
            name_part = os.path.splitext(f)[0]
            # strip leading "<num>. " patterns
            name_part = re.sub(r"^\d+\.\s*", "", name_part)
            title = name_part
        if not artist:
            artist = "Unknown"
        if not album:
            album = os.path.basename(root)
        slug = slugify(title)
        dest_file = f"{slug}.mp3"
        dest_path = os.path.join(SONGS_DIR, dest_file)
        # Copy file
        shutil.copy2(orig_path, dest_path)
        entry = {
            "id": len(entries)+1,
            "original_filename": f,
            "original_path": orig_path,
            "song_name": title,
            "artist_name": artist,
            "album_name": album,
            "file_extension": "mp3",
            "file_size_bytes": size_bytes,
            "song_file": f"songs/{dest_file}",
            "song_url": "https://cdn.jsdelivr.net/gh/<GITHUB_USERNAME>/<REPOSITORY>/songs/"+dest_file,
            "image_file": f"images/{slug}.webp",
            "image_url": "https://cdn.jsdelivr.net/gh/<GITHUB_USERNAME>/<REPOSITORY>/images/"+slug+".webp",
            "image_source_url": "",
            "lyrics_file": f"lyrics/{slug}.txt",
            "lyrics_url": "https://cdn.jsdelivr.net/gh/<GITHUB_USERNAME>/<REPOSITORY>/lyrics/"+slug+".txt",
            "lyrics_source_url": "",
            "lyrics_status": "not-redistributable"
        }
        entries.append(entry)

# Write songs.json
json_path = os.path.join(DEST_ROOT, 'songs.json')
with open(json_path, 'w', encoding='utf-8') as jf:
    json.dump(entries, jf, indent=2, ensure_ascii=False)

# Generate documentation markdown
md_path = os.path.join(DOC_DIR, 'SONGS.md')
with open(md_path, 'w', encoding='utf-8') as md:
    md.write('# Music Assets\n\n')
    md.write('## Summary Table\n\n')
    md.write('| # | Song | Artist | Song URL | Image URL | Lyrics URL |\n')
    md.write('|---|---|---|---|---|---|\n')
    for e in entries:
        md.write(f"| {e['id']} | {e['song_name']} | {e['artist_name']} | {e['song_url']} | {e['image_url']} | {e['lyrics_url']} |\n")
    md.write('\n')
    for e in entries:
        md.write(f"## {e['id']}. {e['song_name']}\n\n")
        md.write('| Field | Value |\n')
        md.write('|---|---|\n')
        md.write(f"| Song | {e['song_name']} |\n")
        md.write(f"| Artist | {e['artist_name']} |\n")
        md.write(f"| Album | {e.get('album_name','')} |\n")
        md.write(f"| Original File | {e['original_filename']} |\n")
        md.write(f"| Git File | {e['song_file']} |\n")
        md.write(f"| Song CDN URL | {e['song_url']} |\n")
        md.write(f"| Image File | {e['image_file']} |\n")
        md.write(f"| Image CDN URL | {e['image_url']} |\n")
        md.write(f"| Image Source | {e['image_source_url']} |\n")
        md.write(f"| Lyrics File | {e['lyrics_file']} |\n")
        md.write(f"| Lyrics CDN URL | {e['lyrics_url']} |\n")
        md.write(f"| Lyrics Source | {e['lyrics_source_url']} |\n")
        md.write(f"| Lyrics Status | {e['lyrics_status']} |\n\n")

print('Processing complete', file=sys.stderr)
