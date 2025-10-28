import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/theme';

const Input = ({
  label,
  error,
  icon,
  secureTextEntry = false, // ← AGREGAR DEFAULT
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

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
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? THEME.colors.error : THEME.colors.textSecondary}
            style={styles.icon}
          />
        )}
        
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={THEME.colors.placeholder}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false} // ← AGREGAR ESTO
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.eyeIcon}
            activeOpacity={0.7} // ← AGREGAR ESTO
          >
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={THEME.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
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
    paddingHorizontal: THEME.spacing.md,
    height: 56,
  },
  inputContainerFocused: {
    borderColor: THEME.colors.accent,
  },
  inputContainerError: {
    borderColor: THEME.colors.error,
  },
  icon: {
    marginRight: THEME.spacing.sm,
  },
  input: {
    flex: 1,
    ...THEME.typography.body,
    color: THEME.colors.text,
    height: '100%',
    paddingVertical: 0, // ← AGREGAR ESTO
  },
  eyeIcon: {
    padding: THEME.spacing.sm,
  },
  errorText: {
    ...THEME.typography.small,
    color: THEME.colors.error,
    marginTop: THEME.spacing.xs,
    marginLeft: THEME.spacing.xs,
  },
});

export default Input;