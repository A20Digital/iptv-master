import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'
import zlib from 'zlib'

interface Channel {
  id: string
  name: string
  logo: string
}

// EPG sources from iptv-org
const EPG_URLS = [
  'https://iptv-org.github.io/epg/guides/us/tvguide.com.epg.xml.gz'
]

function parseM3U(filePath: string): Channel[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const channels: Channel[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('#EXTINF')) {
      const idMatch = line.match(/tvg-id="([^"]*)"/)
      const logoMatch = line.match(/tvg-logo="([^"]*)"/)
      const nameMatch = line.match(/,(.+)$/)

      if (nameMatch) {
        channels.push({
          id: idMatch && idMatch[1] ? idMatch[1] : nameMatch[1].replace(/[^a-zA-Z0-9]/g, ''),
          name: nameMatch[1].trim(),
          logo: logoMatch ? logoMatch[1] : ''
        })
      }
    }
  }

  return channels
}

function downloadFile(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location!).then(resolve).catch(reject)
        return
      }
      const chunks: Buffer[] = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks)))
      response.on('error', reject)
    }).on('error', reject)
  })
}

async function fetchEPG(): Promise<string> {
  for (const url of EPG_URLS) {
    try {
      console.log(`ℹ Fetching EPG from ${url}...`)
      const buffer = await downloadFile(url)
      
      if (url.endsWith('.gz')) {
        return new Promise((resolve, reject) => {
          zlib.gunzip(buffer, (err, result) => {
            if (err) reject(err)
            else resolve(result.toString('utf-8'))
          })
        })
      }
      return buffer.toString('utf-8')
    } catch (err) {
      console.log(`⚠ Failed to fetch ${url}`)
    }
  }
  throw new Error('Failed to fetch EPG from all sources')
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatXMLTVDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}${month}${day}${hours}${minutes}${seconds} +0000`
}

function filterEPG(fullEpg: string, channelIds: Set<string>): string {
  // Extract channels and programmes that match our channel IDs
  const channelRegex = /<channel id="([^"]*)"[\s\S]*?<\/channel>/g
  const programmeRegex = /<programme[^>]*channel="([^"]*)"[\s\S]*?<\/programme>/g
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<!DOCTYPE tv SYSTEM "xmltv.dtd">\n`
  xml += `<tv generator-info-name="iptv-master" generator-info-url="https://github.com/A20Digital/iptv-master">\n\n`

  // Find matching channels
  let match
  const foundChannels = new Set<string>()
  
  while ((match = channelRegex.exec(fullEpg)) !== null) {
    const channelId = match[1]
    // Check if this channel ID matches any of our channel IDs (partial match)
    for (const id of channelIds) {
      const baseId = id.split('@')[0].split('.')[0]
      if (channelId.toLowerCase().includes(baseId.toLowerCase()) || 
          baseId.toLowerCase().includes(channelId.toLowerCase())) {
        xml += match[0] + '\n'
        foundChannels.add(channelId)
        break
      }
    }
  }

  xml += '\n'

  // Find matching programmes
  while ((match = programmeRegex.exec(fullEpg)) !== null) {
    const channelId = match[1]
    if (foundChannels.has(channelId)) {
      xml += match[0] + '\n'
    }
  }

  xml += `</tv>\n`
  return xml
}

function generateFallbackXMLTV(channels: Channel[]): string {
  const now = new Date()
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<!DOCTYPE tv SYSTEM "xmltv.dtd">\n`
  xml += `<tv generator-info-name="iptv-master" generator-info-url="https://github.com/A20Digital/iptv-master">\n\n`

  // Add channel definitions
  for (const channel of channels) {
    xml += `  <channel id="${escapeXml(channel.id)}">\n`
    xml += `    <display-name>${escapeXml(channel.name)}</display-name>\n`
    if (channel.logo) {
      xml += `    <icon src="${escapeXml(channel.logo)}" />\n`
    }
    xml += `  </channel>\n`
  }

  xml += `\n`

  // Add programmes (7 days) - just channel name, no "Programming"
  for (const channel of channels) {
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour += 2) {
        const startTime = new Date(now)
        startTime.setDate(startTime.getDate() + day)
        startTime.setHours(hour, 0, 0, 0)

        const endTime = new Date(startTime)
        endTime.setHours(hour + 2)

        const startStr = formatXMLTVDate(startTime)
        const endStr = formatXMLTVDate(endTime)

        xml += `  <programme start="${startStr}" stop="${endStr}" channel="${escapeXml(channel.id)}">\n`
        xml += `    <title>${escapeXml(channel.name)}</title>\n`
        xml += `    <desc>Live broadcast on ${escapeXml(channel.name)}</desc>\n`
        xml += `  </programme>\n`
      }
    }
  }

  xml += `</tv>\n`
  return xml
}

async function main() {
  const m3uPath = path.join(process.cwd(), 'index.m3u')
  const outputPath = path.join(process.cwd(), 'epg.xml')

  console.log('ℹ Parsing channels from index.m3u...')
  const channels = parseM3U(m3uPath)
  console.log(`ℹ Found ${channels.length} channels`)

  const channelIds = new Set(channels.map(c => c.id))

  let xmltv: string

  try {
    const fullEpg = await fetchEPG()
    console.log('ℹ Filtering EPG for our channels...')
    xmltv = filterEPG(fullEpg, channelIds)
    
    // Check if we got any programmes
    if (!xmltv.includes('<programme')) {
      console.log('⚠ No matching programmes found, using fallback EPG')
      xmltv = generateFallbackXMLTV(channels)
    }
  } catch (err) {
    console.log('⚠ Failed to fetch EPG, generating fallback...')
    xmltv = generateFallbackXMLTV(channels)
  }

  fs.writeFileSync(outputPath, xmltv)
  console.log(`✓ EPG saved to ${outputPath}`)
}

main().catch(console.error)
