import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import {
  ActivityIndicator,
  Button,
  Text,
  useTheme
} from 'react-native-paper'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'

import { ModelStatus } from '../../constants'
import useOnnxModel from '../../hooks/useOnnxModel'
import useSpeechToText from '../../hooks/useSpeechToText'
import useBoundStore from '../../stores'

import ChatBubble from './ChatBubble'

type TranscriptionSectionProps = {
  audioUrlA?: string
  audioUrlB?: string
}

export default function TranscriptionSection({
  audioUrlA,
  audioUrlB
}: TranscriptionSectionProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isSpeechToTextEnabled = useBoundStore(
    (state) => state.isSpeechToTextEnabled
  )
  const modelStatus = useBoundStore((state) => state.modelStatus)

  const { modelPath, isModelReady } = useOnnxModel()
  const { isTranscribing, conversation, transcribeAll, error } =
    useSpeechToText(audioUrlA, audioUrlB, modelPath)

  const hasStartedRef = useRef(false)
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    const parts = [
      `stt=${isSpeechToTextEnabled}`,
      `model=${modelStatus}`,
      `ready=${isModelReady}`,
      `path=${modelPath ? 'yes' : 'null'}`,
      `transcribing=${isTranscribing}`,
      `conv=${conversation.length}`,
      `err=${error ?? 'none'}`
    ]
    setDebugInfo(parts.join(' | '))
  }, [
    isSpeechToTextEnabled,
    modelStatus,
    isModelReady,
    modelPath,
    isTranscribing,
    conversation.length,
    error
  ])

  useEffect(() => {
    if (isSpeechToTextEnabled && modelPath && !hasStartedRef.current) {
      hasStartedRef.current = true
      transcribeAll()
    }
  }, [isSpeechToTextEnabled, modelPath, transcribeAll])

  if (!isSpeechToTextEnabled) {
    return null
  }

  const styles = makeStyles(theme)

  const isLoading = isTranscribing && conversation.length === 0
  const hasConversation = conversation.length > 0
  const isModelLoading =
    modelStatus === ModelStatus.DOWNLOADING || (!isModelReady && !modelPath)

  const handleRetry = () => {
    hasStartedRef.current = false
    transcribeAll()
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <MaterialIcon color={theme.colors.primary} name='subtitles' size={24} />
        <Text variant='titleMedium'>
          {t('callHistoryDetailScreen.conversationContent')}
        </Text>
      </View>

      {/* Debug info */}
      <View style={styles.debugContainer}>
        <Text variant='labelSmall' style={styles.debugText}>
          {debugInfo}
        </Text>
      </View>

      {isModelLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='small' />
          <Text style={styles.loadingText}>
            {modelStatus === ModelStatus.DOWNLOADING
              ? 'Model downloading...'
              : 'Initializing model...'}
          </Text>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='small' />
          <Text style={styles.loadingText}>
            {t('callHistoryDetailScreen.transcribing')}
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcon name='error-outline' color={theme.colors.error} size={20} />
          <Text style={{ color: theme.colors.error, flex: 1 }}>
            {error}
          </Text>
        </View>
      )}

      {hasConversation && (
        <View style={styles.chatContainer}>
          {!audioUrlA || !audioUrlB ? (
            <Text style={styles.paragraph} variant='bodyMedium'>
              {conversation.map((entry) => entry.text).join(' ')}
            </Text>
          ) : (
            conversation.map((entry, index) => (
              <ChatBubble
                key={`seg-${index}`}
                speaker={entry.speaker}
                text={entry.text}
              />
            ))
          )}
        </View>
      )}

      {/* Manual trigger / retry button */}
      {!isTranscribing && !isModelLoading && (
        <View style={styles.buttonContainer}>
          <Button
            mode='outlined'
            icon='refresh'
            onPress={handleRetry}
            compact
          >
            {hasConversation || error ? 'Retry Transcription' : 'Start Transcription'}
          </Button>
        </View>
      )}
    </View>
  )
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    root: {
      backgroundColor: theme.colors.inverseOnSurface,
      borderRadius: 16,
      marginHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      marginBottom: 24
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 4,
      marginHorizontal: 16,
      marginBottom: 12
    },
    debugContainer: {
      marginHorizontal: 16,
      marginBottom: 8,
      padding: 8,
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: 8
    },
    debugText: {
      fontFamily: 'monospace',
      fontSize: 10,
      opacity: 0.6
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      columnGap: 8,
      paddingVertical: 24
    },
    loadingText: {
      opacity: 0.7
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 8,
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 12,
      backgroundColor: 'rgba(186, 26, 26, 0.08)',
      borderRadius: 8
    },
    chatContainer: {
      paddingHorizontal: 16
    },
    paragraph: {
      lineHeight: 22,
      textAlign: 'justify'
    },
    buttonContainer: {
      alignItems: 'center',
      marginTop: 12
    }
  })
