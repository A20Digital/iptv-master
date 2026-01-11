#!/usr/bin/env python3
"""
Generate M3U playlist with Jellyfin direct stream URLs.
This allows clicking on a channel to play directly without going to the home page.
"""
import json
import requests
import sys

# Configuration
API_KEY = '8b6b2ddee71a4c2685625862dae21eb1'
SERVER_LOCAL = 'http://192.168.50.92:8096'
SERVER_PUBLIC = 'https://fintv.a20labs.com'

def get_channels(server, api_key):
    """Fetch all Live TV channels from Jellyfin."""
    url = f"{server}/LiveTv/Channels?api_key={api_key}"
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.json()

def create_m3u(channels, server, api_key, output_file):
    """Create M3U playlist with direct stream URLs."""
    lines = ['#EXTM3U']
    
    items = channels.get('Items', [])
    for ch in items:
        name = ch.get('Name', 'Unknown')
        ch_id = ch.get('Id')
        ch_num = ch.get('Number') or ch.get('ChannelNumber', '')
        
        # Get logo URL if available
        logo = ''
        if ch.get('ImageTags', {}).get('Primary'):
            logo = f'{server}/Items/{ch_id}/Images/Primary?api_key={api_key}'
        
        # Direct stream URL - this plays immediately without going to channel page
        stream_url = f'{server}/LiveTv/Channels/{ch_id}/stream.m3u8?api_key={api_key}'
        
        extinf = f'#EXTINF:-1 tvg-id="{ch_id}" tvg-chno="{ch_num}" tvg-name="{name}" tvg-logo="{logo}" group-title="Live TV",{name}'
        lines.append(extinf)
        lines.append(stream_url)
    
    with open(output_file, 'w') as f:
        f.write('\n'.join(lines) + '\n')
    
    return len(items)

if __name__ == '__main__':
    # Determine which server to use
    use_public = '--public' in sys.argv
    server = SERVER_PUBLIC if use_public else SERVER_LOCAL
    
    print(f"Fetching channels from {server}...")
    
    try:
        channels = get_channels(server, API_KEY)
        
        # Create local version
        count = create_m3u(channels, SERVER_LOCAL, API_KEY, 'jellyfin_direct_local.m3u')
        print(f"Created jellyfin_direct_local.m3u with {count} channels (local URLs)")
        
        # Create public version
        count = create_m3u(channels, SERVER_PUBLIC, API_KEY, 'jellyfin_direct_public.m3u')
        print(f"Created jellyfin_direct_public.m3u with {count} channels (public URLs)")
        
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to Jellyfin: {e}")
        sys.exit(1)
