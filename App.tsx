import { NavigationContainer } from '@react-navigation/native'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { AppLightTheme } from './configs/theme'
import MainTabs from './navigators/MainTabs'

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={AppLightTheme}>
        <NavigationContainer theme={AppLightTheme}>
          <MainTabs />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  )
}
