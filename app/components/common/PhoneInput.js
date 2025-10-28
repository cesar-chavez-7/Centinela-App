import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import { THEME } from '../../theme/theme';

const COUNTRY_CONFIGS = {
  SV: { code: '+503', minDigits: 8, maxDigits: 8, placeholder: '7777-7777' },
  US: { code: '+1', minDigits: 10, maxDigits: 10, placeholder: '(555) 123-4567' },
  MX: { code: '+52', minDigits: 10, maxDigits: 10, placeholder: '55 1234 5678' },
  GT: { code: '+502', minDigits: 8, maxDigits: 8, placeholder: '5555-5555' },
  HN: { code: '+504', minDigits: 8, maxDigits: 8, placeholder: '9999-9999' },
  NI: { code: '+505', minDigits: 8, maxDigits: 8, placeholder: '8888-8888' },
  CR: { code: '+506', minDigits: 8, maxDigits: 8, placeholder: '8888-8888' },
  PA: { code: '+507', minDigits: 8, maxDigits: 8, placeholder: '6666-6666' },
  ES: { code: '+34', minDigits: 9, maxDigits: 9, placeholder: '612 34 56 78' },
  AR: { code: '+54', minDigits: 10, maxDigits: 10, placeholder: '11 2345-6789' },
  CO: { code: '+57', minDigits: 10, maxDigits: 10, placeholder: '321 123 4567' },
  CL: { code: '+56', minDigits: 9, maxDigits: 9, placeholder: '9 1234 5678' },
  PE: { code: '+51', minDigits: 9, maxDigits: 9, placeholder: '987 654 321' },
};

const PhoneInput = ({
  label,
  error,
  value,
  onChangeText,
  onCountryChange,
  ...props
}) => {
  const [countryCode, setCountryCode] = useState('SV');
  const [showPicker, setShowPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Obtener config con fallback
  const getCountryConfig = (code) => {
    return COUNTRY_CONFIGS[code] || {
      code: '+1',
      minDigits: 7,
      maxDigits: 15,
      placeholder: 'Número de teléfono'
    };
  };

  const currentConfig = getCountryConfig(countryCode);

  const handleCountrySelect = (country) => {
    setCountryCode(country.cca2);
    const config = getCountryConfig(country.cca2);
    
    if (onCountryChange) {
      onCountryChange(country.cca2, config);
    }
  };

  const formatPhoneNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, currentConfig.maxDigits);
    onChangeText(limited);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        <TouchableOpacity
          style={styles.countryButton}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.7}
        >
          <CountryPicker
            countryCode={countryCode}
            withFilter
            withFlag
            withCallingCode
            withEmoji
            onSelect={handleCountrySelect}
            visible={showPicker}
            onClose={() => setShowPicker(false)}
            containerButtonStyle={styles.countryPickerButton}
          />
          <Text style={styles.countryCode}>{currentConfig.code}</Text>
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={formatPhoneNumber}
          placeholder={currentConfig.placeholder}
          placeholderTextColor={THEME.colors.placeholder}
          keyboardType="phone-pad"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={currentConfig.maxDigits}
          {...props}
        />
      </View>

      <View style={styles.footer}>
        {!error && (
          <Text style={styles.infoText}>
            {currentConfig.minDigits === currentConfig.maxDigits
              ? `${currentConfig.maxDigits} dígitos`
              : `${currentConfig.minDigits}-${currentConfig.maxDigits} dígitos`}
          </Text>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.md,
  },
  label: {
    ...THEME.typography.body,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.inputBackground,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingRight: THEME.spacing.md,
    height: 56,
    overflow: 'hidden',
  },
  inputContainerFocused: {
    borderColor: THEME.colors.accent,
  },
  inputContainerError: {
    borderColor: THEME.colors.error,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopLeftRadius: THEME.borderRadius.md,
    borderBottomLeftRadius: THEME.borderRadius.md,
    marginRight: THEME.spacing.sm,
    height: '100%',
  },
  countryPickerButton: {
    marginRight: 4,
  },
  countryCode: {
    ...THEME.typography.body,
    color: THEME.colors.text,
    fontWeight: '600',
    marginLeft: 4,
  },
  arrow: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginLeft: 4,
  },
  input: {
    flex: 1,
    ...THEME.typography.body,
    color: THEME.colors.text,
    height: '100%',
  },
  footer: {
    marginTop: THEME.spacing.xs,
    marginLeft: THEME.spacing.xs,
  },
  infoText: {
    ...THEME.typography.small,
    color: THEME.colors.textSecondary,
  },
  errorText: {
    ...THEME.typography.small,
    color: THEME.colors.error,
  },
});

export default PhoneInput;