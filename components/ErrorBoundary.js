import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App crashed:", error);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <ScrollView style={styles.errorScroll}>
            <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
            <Text style={styles.stackText}>{this.state.errorInfo?.componentStack}</Text>
          </ScrollView>
          <Button 
            title="Try Again" 
            onPress={() => this.setState({ hasError: false })} 
          />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 20,
  },
  errorScroll: {
    maxHeight: 300,
    width: '100%',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  stackText: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default ErrorBoundary;