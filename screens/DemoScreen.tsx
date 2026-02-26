import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Divider, List, Text, useTheme } from 'react-native-paper'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'

import TranscriptionSection from './CallHistoryDetail/TranscriptionSection'

const AUDIO_URL_A =
  'https://res.cloudinary.com/ditcozn90/video/upload/v1770966537/15_07_50-in_n9li47.wav'
const AUDIO_URL_B =
  'https://res.cloudinary.com/ditcozn90/video/upload/v1770966613/15_07_50-out_zwe4yj.wav'

const MOCK_CALL_INFO = {
  contact: '不明',
  phoneNumber: '303',
  date: '2026年2月19日 15:07',
  direction: '着信',
  operator: 'Demo User',
  talkDuration: '1:23'
}

export default function DemoScreen() {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
    >
      {/* Call Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.header}>
          <MaterialIcon
            color={theme.colors.primary}
            name='info-outline'
            size={24}
          />
          <Text variant='titleMedium'>
            {t('callHistoryDetailScreen.callInfo')}
          </Text>
        </View>

        <List.Item
          title={t('callHistoryDetailScreen.contact')}
          description={MOCK_CALL_INFO.contact}
        />
        <Divider />
        <List.Item
          title={t('callHistoryDetailScreen.phoneNumber')}
          description={MOCK_CALL_INFO.phoneNumber}
        />
        <Divider />
        <List.Item
          title={t('callHistoryDetailScreen.date')}
          description={MOCK_CALL_INFO.date}
        />
        <Divider />
        <List.Item
          title={t('callHistoryDetailScreen.direction')}
          description={MOCK_CALL_INFO.direction}
        />
        <Divider />
        <List.Item
          title={t('callHistoryDetailScreen.operator')}
          description={MOCK_CALL_INFO.operator}
        />
        <Divider />
        <List.Item
          title={t('callHistoryDetailScreen.talkDuration')}
          description={MOCK_CALL_INFO.talkDuration}
        />
      </View>

      {/* Transcription Section */}
      <TranscriptionSection audioUrlA={AUDIO_URL_A} audioUrlB={AUDIO_URL_B} />

      <View style={styles.footer}>
        <Text
          variant='bodySmall'
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Audio URLs are hardcoded for demo purposes.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  infoSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    marginBottom: 8
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16
  }
})
