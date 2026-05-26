import { StyleSheet, Text, TextInput, type StyleProp, type TextStyle } from 'react-native'
import {
  Manrope_300Light,
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope'

export const manropeFonts = {
  Manrope_300Light,
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
}

const defaultFontFamily = 'Manrope_400Regular'
type TextComponentWithDefaults = typeof Text & {
  defaultProps?: {
    style?: StyleProp<TextStyle>
  }
}

export function getManropeFontFamily(style: StyleProp<TextStyle>) {
  const flattenedStyle = StyleSheet.flatten(style)
  const fontWeight = flattenedStyle?.fontWeight?.toString()

  if (flattenedStyle?.fontFamily) {
    return flattenedStyle.fontFamily
  }

  if (fontWeight === '300') {
    return 'Manrope_300Light'
  }

  if (fontWeight === '600') {
    return 'Manrope_600SemiBold'
  }

  if (fontWeight === '700' || fontWeight === 'bold') {
    return 'Manrope_700Bold'
  }

  if (fontWeight === '800' || fontWeight === '900') {
    return 'Manrope_800ExtraBold'
  }

  return defaultFontFamily
}

export function applyManropeFontDefaults() {
  const DefaultText = Text as TextComponentWithDefaults
  const DefaultTextInput = TextInput as TextComponentWithDefaults

  DefaultText.defaultProps = DefaultText.defaultProps ?? {}
  DefaultText.defaultProps.style = [DefaultText.defaultProps.style, { fontFamily: defaultFontFamily }]

  DefaultTextInput.defaultProps = DefaultTextInput.defaultProps ?? {}
  DefaultTextInput.defaultProps.style = [DefaultTextInput.defaultProps.style, { fontFamily: defaultFontFamily }]
}
