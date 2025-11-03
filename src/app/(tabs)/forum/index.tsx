import { StyleSheet, Text, View } from 'react-native';

export default function ForumScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>论坛</Text>
      <Text style={styles.subtitle}>即将推出...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
