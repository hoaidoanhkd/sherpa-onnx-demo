import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Dialog, IconButton, Text, useTheme } from 'react-native-paper'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'

import Slider from '@react-native-community/slider'

import { IS_IOS } from '../../constants'
import { IconProps } from '../../types'

function formatDuration(seconds: number): string {
  const total = Math.round(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

type AudioPlayerProps = {
  isPlaying: boolean
  isMuted: boolean
  isError: boolean
  duration: number
  currentTime: number
  handlePlayPause: () => void
  handleBackward: () => void
  handleForward: () => void
  handleToggleVolume: () => void
  handleSlidingComplete: (value: number) => void
  handleSlidingStart: (value: number) => void
}

export default function AudioPlayer({
  isPlaying,
  isMuted,
  isError,
  duration,
  currentTime,
  handleBackward,
  handleForward,
  handleToggleVolume,
  handlePlayPause,
  handleSlidingComplete,
  handleSlidingStart
}: AudioPlayerProps) {
  const theme = useTheme()
  const styles = makeStyles(theme, isPlaying)
  const { t } = useTranslation()

  const backward = (props: IconProps) => (
    <MaterialIcon {...props} name='replay-10' />
  )

  const forward = (props: IconProps) => (
    <MaterialIcon {...props} name='forward-10' />
  )

  if (isError) {
    return (
      <View style={styles.errorWrapper}>
        <Dialog.Icon size={28} icon='alert' />
        <Text>{t('callHistoryDetailScreen.failedToLoadCallRecord')}</Text>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <View style={styles.playSpeedContainer}>
        <View style={styles.title}>
          <MaterialIcon
            color={theme.colors.primary}
            name='multitrack-audio'
            size={24}
          />
          <Text variant='titleMedium'>
            {t('callHistoryDetailScreen.callRecord')}
          </Text>
        </View>

        <IconButton
          icon={isMuted ? 'volume-off' : 'volume-high'}
          mode={isMuted ? undefined : 'contained'}
          size={24}
          style={styles.m0}
          onPress={handleToggleVolume}
        />
      </View>

      <Slider
        style={styles.trackSlider}
        value={currentTime}
        minimumValue={0}
        maximumValue={duration}
        minimumTrackTintColor={theme.colors.inverseSurface}
        maximumTrackTintColor={theme.colors.onSurfaceVariant}
        thumbTintColor={theme.colors.inverseSurface}
        onSlidingComplete={handleSlidingComplete}
        onSlidingStart={handleSlidingStart}
      />
      <View style={styles.time}>
        <Text>{formatDuration(currentTime)}</Text>
        <Text>{formatDuration(duration)}</Text>
      </View>
      <View style={styles.controlsContainer}>
        <IconButton icon={backward} onPress={handleBackward} size={28} />
        <IconButton
          style={styles.playPauseButton}
          mode='contained'
          icon={isPlaying ? 'pause' : 'play'}
          size={40}
          onPress={handlePlayPause}
          iconColor={theme.colors.onSecondaryContainer}
          containerColor={theme.colors.secondaryContainer}
        />
        <IconButton icon={forward} onPress={handleForward} size={28} />
      </View>
    </View>
  )
}

const makeStyles = (theme: any, isPlaying: boolean) => {
  return StyleSheet.create({
    errorWrapper: {
      alignItems: 'center',
      rowGap: 4,
      backgroundColor: theme.colors.inverseOnSurface,
      borderRadius: 12,
      marginHorizontal: 12,
      paddingBottom: 32
    },
    root: {
      backgroundColor: theme.colors.inverseOnSurface,
      borderRadius: 16,
      marginHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 24,
      marginBottom: 24
    },
    playSpeedContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 4,
      marginHorizontal: 16
    },
    title: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 4
    },
    time: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 2,
      marginHorizontal: 16
    },
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    },
    playPauseButton: {
      borderRadius: isPlaying ? 12 : 100
    },
    trackSlider: {
      marginHorizontal: IS_IOS ? 16 : 2
    },
    m0: {
      margin: 0
    }
  })
}
