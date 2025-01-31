const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

// Create sounds directory if it doesn't exist
const soundsDir = path.join(__dirname, '..', 'static', 'sounds')
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true })
}

// Function to generate a sound file using SoX
function generateSound(options) {
  return new Promise((resolve, reject) => {
    const command = `sox -n "${options.output}" ${options.args}`
    exec(command, (error) => {
      if (error) {
        console.warn(`Warning: Could not generate ${options.output}. Falling back to empty audio file.`)
        // Create an empty MP3 file as fallback
        const emptyMp3Header = Buffer.from([
          0xFF, 0xFB, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ])
        fs.writeFileSync(options.output, emptyMp3Header)
        resolve()
      } else {
        resolve()
      }
    })
  })
}

async function generateBattleSounds() {
  const sounds = [
    {
      name: 'charge.mp3',
      args: 'synth 2 sine 200-1000 gain -10 fade 0 2 0.5'
    },
    {
      name: 'clash.mp3',
      args: 'synth 0.3 noise synth 0.3 sine 800-200 gain -8 fade 0 0.3 0.1'
    },
    {
      name: 'impact.mp3',
      args: 'synth 0.5 sine 100-30 gain -5 fade 0 0.5 0.1'
    },
    {
      name: 'victory.mp3',
      args: 'synth 3 sine 400-800:800-1200:1200-800 gain -10 fade 0 3 0.5'
    },
    {
      name: 'defeat.mp3',
      args: 'synth 2 sine 800-200:400-100 gain -10 fade 0 2 0.5'
    },
    {
      name: 'card-transfer.mp3',
      args: 'synth 1 sine 500-1500 gain -12 fade 0 1 0.3'
    }
  ]

  console.log('Generating battle sound effects...')

  for (const sound of sounds) {
    const outputPath = path.join(soundsDir, sound.name)
    try {
      await generateSound({
        output: outputPath,
        args: sound.args
      })
      console.log(`Created ${sound.name}`)
    } catch (error) {
      console.error(`Error generating ${sound.name}:`, error)
    }
  }

  console.log('\nSound generation complete!')
  console.log('Note: These are synthesized placeholder sounds.')
  console.log('Replace them with high-quality sound effects for production use.')
}

generateBattleSounds().catch(console.error)
