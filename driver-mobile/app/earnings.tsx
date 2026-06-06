import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { api } from "@/lib/api";

type Earnings = {
  walletBalance: number;
  earningsToday: number;
  earningsThisWeek: number;
  earningsThisMonth: number;
  totalEarnings: number;
  completedCount: number;
  pendingPayout: number;
  paidPayout: number;
};

function fmt(n: number) {
  return `R ${Math.round(n).toLocaleString("en-ZA")}`;
}

export default function EarningsScreen() {
  const [data, setData] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<Earnings>("/api/driver/earnings");
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#f59e0b" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#f59e0b" />}
    >
      <Text style={styles.h1}>Wallet balance</Text>
      <Text style={styles.hero}>{fmt(data?.walletBalance ?? 0)}</Text>

      <View style={styles.grid}>
        <View style={styles.stat}>
          <Text style={styles.label}>Today</Text>
          <Text style={styles.value}>{fmt(data?.earningsToday ?? 0)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.label}>This week</Text>
          <Text style={styles.value}>{fmt(data?.earningsThisWeek ?? 0)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.label}>This month</Text>
          <Text style={styles.value}>{fmt(data?.earningsThisMonth ?? 0)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.label}>All time</Text>
          <Text style={styles.value}>{fmt(data?.totalEarnings ?? 0)}</Text>
        </View>
      </View>

      <Text style={styles.meta}>
        {data?.completedCount ?? 0} completed deliveries · Pending payout{" "}
        {fmt(data?.pendingPayout ?? 0)} · Paid out {fmt(data?.paidPayout ?? 0)}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", backgroundColor: "#020617" },
  container: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 16, paddingBottom: 32 },
  h1: { color: "#94a3b8", fontSize: 14, marginBottom: 4 },
  hero: { color: "#fff", fontSize: 36, fontWeight: "700", marginBottom: 24 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  stat: {
    width: "47%",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  label: { color: "#64748b", fontSize: 12 },
  value: { color: "#f59e0b", fontSize: 18, fontWeight: "600", marginTop: 4 },
  meta: { color: "#64748b", fontSize: 13, marginTop: 20, lineHeight: 20 },
});
