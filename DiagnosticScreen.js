import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DiagnosticScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagnostic Screen</Text>
      <Text style={styles.text}>If you can see this screen, the app is working!</Text>
      <Text style={styles.text}>The issue might be with the HomeV2 component.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default DiagnosticScreen;