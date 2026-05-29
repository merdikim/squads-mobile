import { StyleSheet, Text, TextInput, type StyleProp, type TextStyle } from 'react-native'
import { Mynerve_400Regular } from '@expo-google-fonts/mynerve'

export const appFonts = {
  Mynerve_400Regular,
}

const defaultFontFamily = 'Mynerve_400Regular'
type TextComponentWithDefaults = typeof Text & {
  defaultProps?: {
    style?: StyleProp<TextStyle>
  }
}

export function getAppFontFamily(style: StyleProp<TextStyle>) {
  const flattenedStyle = StyleSheet.flatten(style)

  if (flattenedStyle?.fontFamily) {
    return flattenedStyle.fontFamily
  }

  return defaultFontFamily
}

export function applyAppFontDefaults() {
  const DefaultText = Text as TextComponentWithDefaults
  const DefaultTextInput = TextInput as TextComponentWithDefaults

  DefaultText.defaultProps = DefaultText.defaultProps ?? {}
  DefaultText.defaultProps.style = [DefaultText.defaultProps.style, { fontFamily: defaultFontFamily }]

  DefaultTextInput.defaultProps = DefaultTextInput.defaultProps ?? {}
  DefaultTextInput.defaultProps.style = [DefaultTextInput.defaultProps.style, { fontFamily: defaultFontFamily }]
}
