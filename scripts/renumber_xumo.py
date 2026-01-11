#!/usr/bin/env python3
import re
import sys

def renumber_playlist(input_file, output_file, start_num=100):
    with open(input_file, 'r') as f:
        content = f.read()

    lines = content.split('\n')
    output_lines = ['#EXTM3U url-tvg="https://raw.githubusercontent.com/BuddyChewChew/xumo-playlist-generator/main/playlists/xumo_epg.xml.gz"']

    channel_num = start_num
    i = 1  # Skip header

    while i < len(lines):
        line = lines[i].strip()
        if line.startswith('#EXTINF:'):
            # Parse the EXTINF line
            match = re.search(r'tvg-id="([^"]*)".*tvg-name="([^"]*)".*tvg-logo="([^"]*)".*group-title="([^"]*)",(.+)$', line)
            if match:
                tvg_id = match.group(1)
                tvg_name = match.group(2)
                tvg_logo = match.group(3)
                group_title = match.group(4)
                display_name = match.group(5)
                
                # Create new EXTINF with channel number
                new_extinf = f'#EXTINF:-1 tvg-id="{tvg_id}" tvg-chno="{channel_num}" tvg-name="{tvg_name}" tvg-logo="{tvg_logo}" group-title="{group_title}",{display_name}'
                output_lines.append(new_extinf)
                
                # Get the stream URL (next line)
                i += 1
                if i < len(lines) and lines[i].strip():
                    output_lines.append(lines[i].strip())
                
                channel_num += 1
        i += 1

    # Write output
    with open(output_file, 'w') as f:
        f.write('\n'.join(output_lines) + '\n')

    return channel_num - start_num

if __name__ == '__main__':
    count = renumber_playlist('/tmp/xumo_original.m3u', 'xumo.m3u', 100)
    print(f"Created xumo.m3u with {count} channels numbered 100 to {99 + count}")
