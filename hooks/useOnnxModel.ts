import { useCallback, useEffect, useRef, useState } from 'react'
import * as RNFS from 'react-native-fs'

import {
  ModelStatus,
  ONNX_MODEL_BASE_URL,
  ONNX_MODEL_DIR_NAME,
  ONNX_MODEL_FILES
} from '../constants'
import useBoundStore from '../stores'
import { initOnnxModel, releaseOnnxModel } from '../utils/onnxContext'

const MODEL_DIR = `${RNFS.DocumentDirectoryPath}/${ONNX_MODEL_DIR_NAME}`

export default function useOnnxModel() {
  const setModelStatus = useBoundStore((s) => s.setModelStatus)
  const setDownloadProgress = useBoundStore((s) => s.setDownloadProgress)
  const setIsSpeechToTextEnabled = useBoundStore(
    (s) => s.setIsSpeechToTextEnabled
  )

  const [isModelReady, setIsModelReady] = useState(false)
  const downloadJobIdRef = useRef<number | null>(null)
  const isCancelledRef = useRef(false)

  const cancelCurrentDownload = useCallback(async () => {
    isCancelledRef.current = true
    if (downloadJobIdRef.current !== null) {
      RNFS.stopDownload(downloadJobIdRef.current)
      downloadJobIdRef.current = null
    }
    if (await RNFS.exists(MODEL_DIR)) {
      await RNFS.unlink(MODEL_DIR).catch(() => {})
    }
  }, [])

  const checkModel = useCallback(async () => {
    const dirExists = await RNFS.exists(MODEL_DIR)
    if (!dirExists) {
      setModelStatus(ModelStatus.NOT_DOWNLOADED)
      setIsModelReady(false)
      return
    }

    for (const file of ONNX_MODEL_FILES) {
      const filePath = `${MODEL_DIR}/${file.localName}`
      const exists = await RNFS.exists(filePath)
      if (!exists) {
        setModelStatus(ModelStatus.NOT_DOWNLOADED)
        setIsModelReady(false)
        return
      }

      const stat = await RNFS.stat(filePath)
      const size = Number(stat.size)
      if (size < file.minSize) {
        await RNFS.unlink(MODEL_DIR).catch(() => {})
        setModelStatus(ModelStatus.NOT_DOWNLOADED)
        setIsModelReady(false)
        return
      }
    }

    setModelStatus(ModelStatus.DOWNLOADED)
    setIsModelReady(true)

    initOnnxModel(MODEL_DIR)
      .then((success) => {
        if (!success) {
          setIsModelReady(false)
        }
      })
      .catch(() => {
        setIsModelReady(false)
      })
  }, [setModelStatus])

  const downloadModel = useCallback(async () => {
    await cancelCurrentDownload()
    isCancelledRef.current = false

    setModelStatus(ModelStatus.DOWNLOADING)
    setDownloadProgress(0)

    if (!(await RNFS.exists(MODEL_DIR))) {
      await RNFS.mkdir(MODEL_DIR)
    }

    let totalBytesDownloaded = 0
    let totalExpectedBytes = 0

    for (const file of ONNX_MODEL_FILES) {
      totalExpectedBytes += file.minSize
    }

    for (let i = 0; i < ONNX_MODEL_FILES.length; i++) {
      if (isCancelledRef.current) {
        setModelStatus(ModelStatus.NOT_DOWNLOADED)
        setDownloadProgress(0)
        return
      }

      const file = ONNX_MODEL_FILES[i]
      const localPath = `${MODEL_DIR}/${file.localName}`
      const fileUrl = `${ONNX_MODEL_BASE_URL}${file.remoteName}`

      const downloadResult = RNFS.downloadFile({
        fromUrl: fileUrl,
        toFile: localPath,
        progress: (res) => {
          const currentFileProgress = res.bytesWritten
          const overallProgress = Math.round(
            ((totalBytesDownloaded + currentFileProgress) /
              (totalExpectedBytes * 1.2)) *
              100
          )
          setDownloadProgress(Math.min(overallProgress, 99))
        },
        progressInterval: 500
      })

      downloadJobIdRef.current = downloadResult.jobId

      const result = await downloadResult.promise
      downloadJobIdRef.current = null

      if (result.statusCode !== 200) {
        await RNFS.unlink(MODEL_DIR).catch(() => {})
        setModelStatus(ModelStatus.NOT_DOWNLOADED)
        setDownloadProgress(0)
        return
      }

      const stat = await RNFS.stat(localPath)
      totalBytesDownloaded += Number(stat.size)
    }

    setModelStatus(ModelStatus.DOWNLOADED)
    setDownloadProgress(100)
    setIsSpeechToTextEnabled(true)
    setIsModelReady(true)

    initOnnxModel(MODEL_DIR)
      .then((success) => {
        if (!success) {
          setIsModelReady(false)
        }
      })
      .catch(() => {
        setIsModelReady(false)
      })
  }, [
    setModelStatus,
    setDownloadProgress,
    setIsSpeechToTextEnabled,
    cancelCurrentDownload
  ])

  const deleteModel = useCallback(async () => {
    await releaseOnnxModel()
    await cancelCurrentDownload()

    if (await RNFS.exists(MODEL_DIR)) {
      await RNFS.unlink(MODEL_DIR).catch(() => {})
    }

    setModelStatus(ModelStatus.NOT_DOWNLOADED)
    setDownloadProgress(0)
    setIsSpeechToTextEnabled(false)
    setIsModelReady(false)
  }, [
    setModelStatus,
    setDownloadProgress,
    setIsSpeechToTextEnabled,
    cancelCurrentDownload
  ])

  useEffect(() => {
    checkModel()
  }, [checkModel])

  return {
    modelPath: isModelReady ? MODEL_DIR : null,
    isModelReady,
    downloadModel,
    deleteModel,
    checkModel
  }
}
