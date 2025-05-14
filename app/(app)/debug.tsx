// app/(app)/debug.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, Platform } from 'react-native';
import { API_URL } from '../../src/api/config';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DebugScreen() {
  const [status, setStatus] = useState('Ready to test');
  const [responseData, setResponseData] = useState('');

  const testConnection = async () => {
    setStatus('Testing connection...');
    try {
      // Try a basic fetch to the root URL
      const response = await fetch(API_URL);
      const text = await response.text();
      setStatus(`Connection successful (${response.status})`);
      setResponseData(text.substring(0, 300) + (text.length > 300 ? '...' : ''));
    } catch (error) {
      if (error instanceof Error) {
        setStatus(`Error: ${error.message}`);
      } else {
        setStatus(`Error: ${String(error)}`);
      }
      setResponseData('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Debug Screen</Text>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>App Information:</Text>
          <Text style={styles.infoText}>API URL: {API_URL}</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button title="Test API Connection" onPress={testConnection} />
        </View>
        
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Status:</Text>
          <Text style={styles.resultText}>{status}</Text>
          
          {responseData ? (
            <>
              <Text style={styles.resultTitle}>Response:</Text>
              <Text style={styles.responseText}>{responseData}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  responseText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});