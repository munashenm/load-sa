import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { api, clearToken } from "@/lib/api";
import { jobStatusLabel } from "@/lib/job-utils";

type Job = {
  id: string;
  reference: string;
  pickupCity: string;
  dropoffCity: string;
  estimatedPrice: number;
  status: string;
  vehicleType?: string;
};

export default function JobsScreen() {
  const [openJobs, setOpenJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ openJobs: Job[]; myJobs: Job[] }>("/api/bookings");
      setOpenJobs(data.openJobs ?? []);
      setMyJobs(data.myJobs ?? []);
    } catch {
      await clearToken();
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function accept(id: string) {
    try {
      await api(`/api/bookings/${id}/accept`, { method: "POST" });
      router.push(`/job/${id}`);
    } catch (e) {
      Alert.alert("Could not accept", e instanceof Error ? e.message : "Try again");
    }
  }

  async function logout() {
    await clearToken();
    router.replace("/");
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#f59e0b" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>FluxMove Driver</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push("/earnings")}>
            <Text style={styles.link}>Earnings</Text>
          </Pressable>
          <Pressable onPress={logout}>
            <Text style={styles.logout}>Sign out</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.h1}>Available jobs</Text>
      {openJobs.length === 0 ? (
        <Text style={styles.muted}>
          No jobs matching your vehicle — go online on the web driver hub first.
        </Text>
      ) : (
        openJobs.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.ref}>{item.reference}</Text>
            <Text style={styles.route}>
              {item.pickupCity} → {item.dropoffCity}
            </Text>
            <Text style={styles.price}>R {item.estimatedPrice.toFixed(0)}</Text>
            <Pressable style={styles.btn} onPress={() => accept(item.id)}>
              <Text style={styles.btnText}>Accept job</Text>
            </Pressable>
          </View>
        ))
      )}

      <Text style={[styles.h1, { marginTop: 24 }]}>Active deliveries</Text>
      {myJobs.length === 0 ? (
        <Text style={styles.muted}>No active deliveries</Text>
      ) : (
        myJobs.map((item) => (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() => router.push(`/job/${item.id}`)}
          >
            <Text style={styles.ref}>{item.reference}</Text>
            <Text style={styles.route}>
              {item.pickupCity} → {item.dropoffCity}
            </Text>
            <Text style={styles.muted}>{jobStatusLabel(item.status)}</Text>
            <Text style={styles.openHint}>Tap for navigation, GPS & proof →</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", backgroundColor: "#020617" },
  container: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerActions: { flexDirection: "row", gap: 16, alignItems: "center" },
  title: { color: "#fff", fontSize: 20, fontWeight: "700" },
  link: { color: "#38bdf8", fontSize: 14 },
  logout: { color: "#94a3b8", fontSize: 14 },
  h1: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 8 },
  muted: { color: "#64748b", marginBottom: 12 },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  ref: { color: "#f59e0b", fontFamily: "monospace" },
  route: { color: "#e2e8f0", marginTop: 4 },
  price: { color: "#fff", fontWeight: "600", marginTop: 4 },
  btn: {
    backgroundColor: "#f59e0b",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: "center",
  },
  btnText: { color: "#020617", fontWeight: "600" },
  openHint: { color: "#38bdf8", fontSize: 12, marginTop: 8 },
});
