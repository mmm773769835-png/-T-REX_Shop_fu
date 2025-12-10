import * as React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, Easing, View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  block?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  size = 'medium',
  icon,
  iconPosition = 'left',
  block = false
}) => {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = () => {
    const baseStyles = [styles.button, styles[size], block && styles.block];
    
    switch (variant) {
      case 'secondary':
        return [...baseStyles, styles.secondaryButton];
      case 'outline':
        return [...baseStyles, styles.outlineButton];
      case 'success':
        return [...baseStyles, styles.successButton];
      case 'danger':
        return [...baseStyles, styles.dangerButton];
      case 'warning':
        return [...baseStyles, styles.warningButton];
      case 'info':
        return [...baseStyles, styles.infoButton];
      case 'light':
        return [...baseStyles, styles.lightButton];
      case 'dark':
        return [...baseStyles, styles.darkButton];
      default:
        return [...baseStyles, styles.primaryButton];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
      case 'light':
        return [styles.buttonText, styles.primaryText];
      case 'dark':
        return [styles.buttonText, styles.lightText];
      default:
        return [styles.buttonText, styles.lightText];
    }
  };

  const renderContent = () => {
    const textElement = (
      <Text style={getTextStyle()}>
        {title}
      </Text>
    );

    if (icon) {
      return (
        <View style={styles.contentContainer}>
          {iconPosition === 'left' && icon}
          {textElement}
          {iconPosition === 'right' && icon}
        </View>
      );
    }

    return textElement;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  block: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007bff',
    elevation: 2,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    elevation: 2,
    shadowColor: '#6c757d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007bff',
  },
  successButton: {
    backgroundColor: '#28a745',
    elevation: 2,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dangerButton: {
    backgroundColor: '#dc3545',
    elevation: 2,
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  warningButton: {
    backgroundColor: '#ffc107',
    elevation: 2,
    shadowColor: '#ffc107',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  infoButton: {
    backgroundColor: '#17a2b8',
    elevation: 2,
    shadowColor: '#17a2b8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  lightButton: {
    backgroundColor: '#f8f9fa',
    elevation: 2,
    shadowColor: '#f8f9fa',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  darkButton: {
    backgroundColor: '#343a40',
    elevation: 2,
    shadowColor: '#343a40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  lightText: {
    color: '#ffffff',
  },
  primaryText: {
    color: '#007bff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    color: '#cccccc',
  },
});

export default Button;