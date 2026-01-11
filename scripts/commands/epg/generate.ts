import fs from 'fs'
import path from 'path'

interface Channel {
  id: string
  name: string
  logo: string
}

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

function generateXMLTV(channels: Channel[]): string {
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

  // Add placeholder programmes (7 days)
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
        xml += `    <title>${escapeXml(channel.name)} Programming</title>\n`
        xml += `    <desc>Programming on ${escapeXml(channel.name)}</desc>\n`
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

  console.log('ℹ Generating XMLTV file...')
  const xmltv = generateXMLTV(channels)

  fs.writeFileSync(outputPath, xmltv)
  console.log(`✓ EPG saved to ${outputPath}`)
}

main().catch(console.error)
