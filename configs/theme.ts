import merge from 'deepmerge'
import {
  adaptNavigationTheme,
  MD3DarkTheme as PaperDarkTheme,
  MD3LightTheme as PaperLightTheme
} from 'react-native-paper'

import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme
} from '@react-navigation/native'

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme
})

const customColors = {
  light: {
    primary: 'rgb(0, 106, 97)',
    onPrimary: 'rgb(255, 255, 255)',
    primaryContainer: 'rgb(114, 248, 231)',
    onPrimaryContainer: 'rgb(0, 32, 29)',
    secondary: 'rgb(114, 92, 0)',
    onSecondary: 'rgb(255, 255, 255)',
    secondaryContainer: 'rgb(255, 224, 128)',
    onSecondaryContainer: 'rgb(35, 27, 0)',
    tertiary: 'rgb(145, 77, 0)',
    onTertiary: 'rgb(255, 255, 255)',
    tertiaryContainer: 'rgb(255, 220, 195)',
    onTertiaryContainer: 'rgb(47, 21, 0)',
    error: 'rgb(186, 26, 26)',
    onError: 'rgb(255, 255, 255)',
    errorContainer: 'rgb(255, 218, 214)',
    onErrorContainer: 'rgb(65, 0, 2)',
    background: 'rgb(250, 253, 251)',
    onBackground: 'rgb(25, 28, 27)',
    surface: 'rgb(250, 253, 251)',
    onSurface: 'rgb(25, 28, 27)',
    surfaceVariant: 'rgb(218, 229, 226)',
    onSurfaceVariant: 'rgb(63, 73, 71)',
    outline: 'rgb(111, 121, 119)',
    outlineVariant: 'rgb(190, 201, 198)',
    shadow: 'rgb(0, 0, 0)',
    scrim: 'rgb(0, 0, 0)',
    inverseSurface: 'rgb(45, 49, 48)',
    inverseOnSurface: 'rgb(239, 241, 239)',
    inversePrimary: 'rgb(81, 219, 203)',
    elevation: {
      level0: 'transparent',
      level1: 'rgb(238, 246, 243)',
      level2: 'rgb(230, 241, 239)',
      level3: 'rgb(223, 237, 234)',
      level4: 'rgb(220, 235, 233)',
      level5: 'rgb(215, 232, 229)'
    },
    surfaceDisabled: 'rgba(25, 28, 27, 0.12)',
    onSurfaceDisabled: 'rgba(25, 28, 27, 0.38)',
    backdrop: 'rgba(41, 50, 49, 0.4)'
  },
  dark: {
    primary: 'rgb(81, 219, 203)',
    onPrimary: 'rgb(0, 55, 50)',
    primaryContainer: 'rgb(0, 80, 73)',
    onPrimaryContainer: 'rgb(114, 248, 231)',
    secondary: 'rgb(231, 195, 73)',
    onSecondary: 'rgb(60, 47, 0)',
    secondaryContainer: 'rgb(86, 69, 0)',
    onSecondaryContainer: 'rgb(255, 224, 128)',
    tertiary: 'rgb(255, 183, 126)',
    onTertiary: 'rgb(77, 38, 0)',
    tertiaryContainer: 'rgb(110, 57, 0)',
    onTertiaryContainer: 'rgb(255, 220, 195)',
    error: 'rgb(255, 180, 171)',
    onError: 'rgb(105, 0, 5)',
    errorContainer: 'rgb(147, 0, 10)',
    onErrorContainer: 'rgb(255, 180, 171)',
    background: 'rgb(25, 28, 27)',
    onBackground: 'rgb(224, 227, 225)',
    surface: 'rgb(25, 28, 27)',
    onSurface: 'rgb(224, 227, 225)',
    surfaceVariant: 'rgb(63, 73, 71)',
    onSurfaceVariant: 'rgb(190, 201, 198)',
    outline: 'rgb(137, 147, 144)',
    outlineVariant: 'rgb(63, 73, 71)',
    shadow: 'rgb(0, 0, 0)',
    scrim: 'rgb(0, 0, 0)',
    inverseSurface: 'rgb(224, 227, 225)',
    inverseOnSurface: 'rgb(45, 49, 48)',
    inversePrimary: 'rgb(0, 106, 97)',
    elevation: {
      level0: 'transparent',
      level1: 'rgb(28, 38, 36)',
      level2: 'rgb(30, 43, 41)',
      level3: 'rgb(31, 49, 46)',
      level4: 'rgb(32, 51, 48)',
      level5: 'rgb(33, 55, 52)'
    },
    surfaceDisabled: 'rgba(224, 227, 225, 0.12)',
    onSurfaceDisabled: 'rgba(224, 227, 225, 0.38)',
    backdrop: 'rgba(41, 50, 48, 0.4)'
  }
}

// Paper theme (with fonts + MD3 typography) merged with custom colors
export const AppLightTheme = merge(merge(PaperLightTheme, LightTheme), {
  colors: customColors.light
})

export const AppDarkTheme = merge(merge(PaperDarkTheme, DarkTheme), {
  colors: customColors.dark
})
