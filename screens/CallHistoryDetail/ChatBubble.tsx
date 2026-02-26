import { StyleSheet, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

import { Speaker } from '../../types'

type ChatBubbleProps = {
  speaker: Speaker
  text: string
}

export default function ChatBubble({ speaker, text }: ChatBubbleProps) {
  const theme = useTheme()
  const isOperator = speaker === 'A'

  const bubbleBackground = isOperator
    ? theme.colors.primaryContainer
    : theme.colors.tertiaryContainer

  const bubbleTextColor = isOperator
    ? theme.colors.onPrimaryContainer
    : theme.colors.onTertiaryContainer

  return (
    <View
      style={[
        styles.container,
        isOperator ? styles.containerLeft : styles.containerRight
      ]}
    >
      <View
        style={[
          styles.bubble,
          { backgroundColor: bubbleBackground },
          isOperator ? styles.bubbleOperator : styles.bubbleCustomer
        ]}
      >
        <Text style={[styles.text, { color: bubbleTextColor }]}>{text}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    maxWidth: '80%'
  },
  containerLeft: {
    alignSelf: 'flex-start'
  },
  containerRight: {
    alignSelf: 'flex-end'
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12
  },
  bubbleOperator: {
    borderTopLeftRadius: 4
  },
  bubbleCustomer: {
    borderTopRightRadius: 4
  },
  text: {
    fontSize: 14,
    lineHeight: 20
  }
})
