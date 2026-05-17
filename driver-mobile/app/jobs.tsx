import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { api, clearToken } from "@/lib/api";
import {
  startBackgroundTracking,
  stopBackgroundTracking,
} from "@/lib/location-task";

type Job = {
  id: string;
  reference: string;
  pickupCity: string;
  dropoffCity: string;
  estimatedPrice: number;
  status: string;
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

  useFocusEffect(() => {
    load();
  });

  async function accept(id: string) {
    await api(`/api/bookings/${id}/accept`, { method: "POST" });
    load();
  }

  async function trackJob(id: string, start: boolean) {
    if (start) {
      await startBackgroundTracking(id);
    } else {
      await stopBackgroundTracking();
    }
    alert(start ? "Background GPS started" : "GPS stopped");
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
      <Text style={styles.h1}>Open jobs</Text>
      <FlatList
        data={openJobs}
        keyExtractor={(j) => j.id}
        ListEmptyComponent={<Text style={styles.muted}>No open jobs</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.ref}>{item.reference}</Text>
            <Text style={styles.route}>
              {item.pickupCity} → {item.dropoffCity}
            </Text>
            <Text style={styles.price}>R {item.estimatedPrice}</Text>
            <Pressable style={styles.btn} onPress={() => accept(item.id)}>
              <Text style={styles.btnText}>Accept</Text>
            </Pressable>
          </View>
        )}
      />

      <Text style={[styles.h1, { marginTop: 24 }]}>My jobs</Text>
      <FlatList
        data={myJobs}
        keyExtractor={(j) => j.id}
        ListEmptyComponent={<Text style={styles.muted}>No active jobs</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.ref}>{item.reference}</Text>
            <Text style={styles.route}>
              {item.pickupCity} → {item.dropoffCity}
            </Text>
            <Text style={styles.muted}>Status: {item.status}</Text>
            {item.status !== "DELIVERED" && item.status !== "CANCELLED" && (
              <Pressable
                style={[styles.btn, styles.btnSecondary]}
                onPress={() => trackJob(item.id, true)}
              >
                <Text style={styles.btnTextDark}>Start background GPS</Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", backgroundColor: "#020617" },
  container: { flex: 1, padding: 16, backgroundColor: "#020617" },
  h1: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 8 },
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
  btnSecondary: { backgroundColor: "#334155" },
  btnText: { color: "#020617", fontWeight: "600" },
  btnTextDark: { color: "#fff", fontWeight: "600" },
});
