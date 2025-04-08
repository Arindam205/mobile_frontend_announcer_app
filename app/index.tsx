import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { isAuthenticated } = useAuth();
  
  // Redirect to the appropriate screen based on authentication status
  return <Redirect href={isAuthenticated ? "/(app)/home" : "/(auth)/login"} />;
}