import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { getToken, mobileLogin } from "@/lib/api";

export default function LoginScreen() {
  const [email, setEmail] = useState(__DEV__ ? "driver@demo.co.za" : "");
  const [password, setPassword] = useState(__DEV__ ? "demo12345" : "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getToken().then((t) => {
      if (t) router.replace("/jobs");
      else setLoading(false);
    });
  }, []);

  async function onLogin() {
    setError(null);
    setLoading(true);
    try {
      await mobileLogin(email.trim(), password);
      router.replace("/jobs");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#f59e0b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fluxmove Driver</Text>
      <Text style={styles.sub}>Sign in to accept jobs & share GPS</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#64748b"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.btn} onPress={onLogin}>
        <Text style={styles.btnText}>Sign in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", backgroundColor: "#020617" },
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#020617" },
  title: { fontSize: 28, fontWeight: "700", color: "#fff" },
  sub: { color: "#94a3b8", marginTop: 8, marginBottom: 24 },
  input: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    marginBottom: 12,
  },
  error: { color: "#f87171", marginBottom: 8 },
  btn: {
    backgroundColor: "#f59e0b",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#020617", fontWeight: "700", fontSize: 16 },
});
