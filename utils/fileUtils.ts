import { Buffer } from 'buffer'
import * as RNFS from 'react-native-fs'

import { STT_DURATION_BYTES, WAV_HEADER_SIZE } from '../constants'

const RESAMPLE_CHUNK_SAMPLES = 500_000

export const getTempPath = (name: string) =>
  `${RNFS.DocumentDirectoryPath}/${name}`

async function resampleWav8To16(
  inputPath: string,
  outputPath: string
): Promise<void> {
  const headerBase64 = await RNFS.read(inputPath, WAV_HEADER_SIZE, 0, 'base64')
  const headerBytes = Uint8Array.from(Buffer.from(headerBase64, 'base64'))

  if (headerBytes.length < WAV_HEADER_SIZE) {
    throw new Error('Invalid WAV file')
  }

  const headerView = new DataView(
    headerBytes.buffer,
    headerBytes.byteOffset,
    headerBytes.byteLength
  )
  const numChannels = headerView.getUint16(22, true)
  const bitsPerSample = headerView.getUint16(34, true)

  const stat = await RNFS.stat(inputPath)
  const fileSize = Number(stat.size)
  const totalPcmBytes = fileSize - WAV_HEADER_SIZE
  const totalInputSamples = Math.floor(totalPcmBytes / 2)
  const totalOutputSamples = totalInputSamples * 2

  const newHeader = new Uint8Array(headerBytes)
  const newHeaderView = new DataView(newHeader.buffer)
  newHeaderView.setUint32(24, 16000, true)
  const byteRate = 16000 * numChannels * (bitsPerSample / 8)
  newHeaderView.setUint32(28, byteRate, true)
  newHeaderView.setUint32(40, totalOutputSamples * 2, true)
  newHeaderView.setUint32(4, 36 + totalOutputSamples * 2, true)

  await RNFS.writeFile(
    outputPath,
    Buffer.from(newHeader).toString('base64'),
    'base64'
  )

  let samplesProcessed = 0
  while (samplesProcessed < totalInputSamples) {
    const chunkSamples = Math.min(
      RESAMPLE_CHUNK_SAMPLES,
      totalInputSamples - samplesProcessed
    )
    const readOffset = WAV_HEADER_SIZE + samplesProcessed * 2
    const readLen = chunkSamples * 2

    const chunkBase64 = await RNFS.read(
      inputPath,
      readLen,
      readOffset,
      'base64'
    )
    const chunkBytes = Uint8Array.from(Buffer.from(chunkBase64, 'base64'))
    const inputView = new DataView(
      chunkBytes.buffer,
      chunkBytes.byteOffset,
      chunkBytes.byteLength
    )

    const actualSamples = Math.floor(chunkBytes.length / 2)
    const outputPcm = new Uint8Array(actualSamples * 4)
    const outputView = new DataView(outputPcm.buffer)

    for (let i = 0; i < actualSamples; i++) {
      const current = inputView.getInt16(i * 2, true)
      const next =
        i + 1 < actualSamples ? inputView.getInt16((i + 1) * 2, true) : current

      const interpolated = Math.round((current + next) / 2)

      const outIdx = i * 4
      outputView.setInt16(outIdx, current, true)
      outputView.setInt16(outIdx + 2, interpolated, true)
    }

    await RNFS.appendFile(
      outputPath,
      Buffer.from(outputPcm).toString('base64'),
      'base64'
    )

    samplesProcessed += actualSamples
  }
}

export async function downloadPartialAudio(
  url: string,
  name: string,
  shouldResample = true
): Promise<string> {
  const path = getTempPath(name)

  try {
    if (await RNFS.exists(path)) {
      await RNFS.unlink(path)
    }

    const result = await RNFS.downloadFile({
      fromUrl: url,
      toFile: path,
      headers: {
        Range: `bytes=0-${STT_DURATION_BYTES}`
      }
    }).promise

    if (result.statusCode !== 200 && result.statusCode !== 206) {
      throw new Error('Download failed')
    }

    if (!shouldResample) {
      return path
    }

    const resampledPath = getTempPath(`resampled_${name}`)

    if (await RNFS.exists(resampledPath)) {
      await RNFS.unlink(resampledPath)
    }

    await resampleWav8To16(path, resampledPath)

    await RNFS.unlink(path).catch(() => {})

    return resampledPath
  } catch {
    return path
  }
}

export async function cleanupFiles(files: string[]) {
  await Promise.all(
    files.map(async (file) => {
      try {
        if (await RNFS.exists(file)) {
          await RNFS.unlink(file)
        }
      } catch {
        // skip
      }
    })
  )
}
