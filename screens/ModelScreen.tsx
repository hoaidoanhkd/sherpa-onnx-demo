import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import {
  ActivityIndicator,
  Button,
  Dialog,
  IconButton,
  List,
  Portal,
  Switch,
  Text,
  useTheme
} from 'react-native-paper'

import { ModelStatus } from '../constants'
import useOnnxModel from '../hooks/useOnnxModel'
import useBoundStore from '../stores'

export default function ModelScreen() {
  const { t } = useTranslation()
  const theme = useTheme()

  const isSpeechToTextEnabled = useBoundStore(
    (state) => state.isSpeechToTextEnabled
  )
  const setIsSpeechToTextEnabled = useBoundStore(
    (state) => state.setIsSpeechToTextEnabled
  )
  const modelStatus = useBoundStore((state) => state.modelStatus)
  const downloadProgress = useBoundStore((state) => state.downloadProgress)

  const { downloadModel, deleteModel } = useOnnxModel()

  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleToggleSpeechToText = () => {
    if (isSpeechToTextEnabled) {
      setShowDisableDialog(true)
    } else {
      if (modelStatus === ModelStatus.DOWNLOADED) {
        setIsSpeechToTextEnabled(true)
      } else {
        setShowDownloadDialog(true)
      }
    }
  }

  const handleConfirmDownload = () => {
    setShowDownloadDialog(false)
    downloadModel()
  }

  const handleConfirmDisable = () => {
    setIsSpeechToTextEnabled(false)
    setShowDisableDialog(false)
  }

  const handleDeleteModel = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDeleteModel = () => {
    setShowDeleteDialog(false)
    deleteModel()
  }

  const speechToTextLeftIcon = () => <List.Icon icon='text-to-speech' />
  const aiModelLeftIcon = () => <List.Icon icon='download-circle-outline' />

  const renderSpeechToTextToggle = () => (
    <Switch
      value={isSpeechToTextEnabled}
      onValueChange={handleToggleSpeechToText}
      disabled={modelStatus === ModelStatus.DOWNLOADING}
    />
  )

  const renderModelRight = () => {
    if (modelStatus === ModelStatus.DOWNLOADING) {
      return <ActivityIndicator size='small' />
    }
    if (modelStatus === ModelStatus.DOWNLOADED) {
      return <IconButton icon='delete-outline' onPress={handleDeleteModel} />
    }
    return null
  }

  const getModelStatusText = () => {
    if (modelStatus === ModelStatus.DOWNLOADING) {
      return t('settingScreen.modelDownloading', { progress: downloadProgress })
    }
    if (modelStatus === ModelStatus.DOWNLOADED) {
      return t('settingScreen.modelDownloaded', { size: 161 })
    }
    return t('settingScreen.modelNotDownloaded')
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text variant='headlineMedium' style={styles.title}>
          Sherpa ONNX Demo
        </Text>
        <Text variant='bodyMedium' style={{ color: theme.colors.onSurfaceVariant }}>
          Speech-to-Text Model Management
        </Text>
      </View>

      <List.Section>
        <List.Subheader>{t('settingScreen.callRecordSection')}</List.Subheader>

        <List.Item
          title={t('settingScreen.speechToText')}
          description={t('settingScreen.speechToTextDescription')}
          left={speechToTextLeftIcon}
          right={renderSpeechToTextToggle}
          style={styles.pL16}
        />

        <List.Item
          title={t('settingScreen.aiModelStatus')}
          description={getModelStatusText()}
          left={aiModelLeftIcon}
          right={renderModelRight}
          style={styles.pL16}
        />
      </List.Section>

      {/* Download Model Dialog */}
      <Portal>
        <Dialog
          visible={showDownloadDialog}
          onDismiss={() => setShowDownloadDialog(false)}
        >
          <Dialog.Title>{t('settingScreen.enableDialogTitle')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('settingScreen.enableDialogMessage')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDownloadDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onPress={handleConfirmDownload}>
              {t('settingScreen.downloadNow')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Disable Dialog */}
      <Portal>
        <Dialog
          visible={showDisableDialog}
          onDismiss={() => setShowDisableDialog(false)}
        >
          <Dialog.Title>{t('settingScreen.disableDialogTitle')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('settingScreen.disableDialogMessage')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDisableDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onPress={handleConfirmDisable}>
              {t('settingScreen.disableDialogConfirm')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete Model Dialog */}
      <Portal>
        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
        >
          <Dialog.Title>{t('settingScreen.deleteDialogTitle')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('settingScreen.deleteDialogMessage')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onPress={handleConfirmDeleteModel} textColor='#C62828'>
              {t('settingScreen.deleteDialogConfirm')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  pL16: {
    paddingLeft: 16
  }
})
