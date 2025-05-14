// components/AppErrorBoundary.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('App Error:', error);
    console.error('Error Stack:', errorInfo.componentStack);
    
    this.setState({
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.error}>{this.state.error?.toString()}</Text>
          <Text style={styles.info}>
            Please restart the app or contact support if this issue persists.
          </Text>
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
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#e74c3c',
  },
  error: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  info: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
});

export default AppErrorBoundary;