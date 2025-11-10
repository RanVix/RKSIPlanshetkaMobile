import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is a modal</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text style={styles.linkText}>Go to home screen</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0F1318',
  },
  title: { fontSize: 20, fontWeight: '600', color: '#E5E7EB' },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: { color: '#0A84FF', fontWeight: '500' },
});
