const fs = require('fs')
const path = require('path')

// Create sounds directory if it doesn't exist
const soundsDir = path.join(__dirname, '..', 'static', 'sounds')
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true })
}

// Create empty MP3 files
const sounds = [
  'move.mp3',
  'win.mp3',
  'lose.mp3',
  'draw.mp3',
  'victory.mp3',
  'defeat.mp3',
  'card-transfer.mp3'
]

// Minimal valid MP3 file header (empty audio)
const emptyMp3Header = Buffer.from([
  0xFF, 0xFB, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
])

sounds.forEach(sound => {
  const filePath = path.join(soundsDir, sound)
  fs.writeFileSync(filePath, emptyMp3Header)
  console.log(`Created ${sound}`)
})

console.log('\nSound files created successfully!')
console.log('Note: These are placeholder files. Replace them with actual sound effects.')
