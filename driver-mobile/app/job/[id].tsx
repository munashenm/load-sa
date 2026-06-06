import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { api, uploadImageUri } from "@/lib/api";
import {
  jobStatusLabel,
  mapsDirectionsUrl,
  nextJobStatus,
  parseStopsJson,
} from "@/lib/job-utils";
import {
  startBackgroundTracking,
  stopBackgroundTracking,
} from "@/lib/location-task";

type BookingDetail = {
  id: string;
  reference: string;
  status: string;
  paymentStatus: string;
  pickupAddress: string;
  pickupCity: string;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropoffAddress: string;
  dropoffCity: string;
  dropoffLat?: number | null;
  dropoffLng?: number | null;
  stopsJson?: string | null;
  cargoDescription?: string | null;
  estimatedPrice: number;
  deliveryOtpVerifiedAt?: string | null;
  customer: { fullName: string; phone?: string };
  proofs: { type: string }[];
};

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [tracking, setTracking] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api<{ booking: BookingDetail }>(`/api/bookings/${id}`);
      setBooking(data.booking);
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not load job");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function advanceStatus() {
    if (!booking) return;
    const next = nextJobStatus(booking.status);
    if (!next) return;
    setBusy("status");
    try {
      await api(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      await load();
    } catch (e) {
      Alert.alert("Status update failed", e instanceof Error ? e.message : "Try again");
    } finally {
      setBusy(null);
    }
  }

  async function toggleGps() {
    if (!booking) return;
    setBusy("gps");
    try {
      if (tracking) {
        await stopBackgroundTracking();
        setTracking(false);
      } else {
        await startBackgroundTracking(booking.id);
        setTracking(true);
      }
    } catch (e) {
      Alert.alert("GPS error", e instanceof Error ? e.message : "Permission required");
    } finally {
      setBusy(null);
    }
  }

  async function uploadProof(proofType: "PICKUP" | "DELIVERY") {
    if (!booking) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Camera required", "Allow camera access to upload proof photos.");
      return;
    }
    const shot = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (shot.canceled || !shot.assets[0]?.uri) return;

    setBusy("proof");
    try {
      const imageUrl = await uploadImageUri(shot.assets[0].uri);
      await api(`/api/bookings/${booking.id}/proof`, {
        method: "POST",
        body: JSON.stringify({
          proofType,
          imageUrl,
          notes: proofType === "PICKUP" ? "Pickup proof (mobile)" : "Delivery proof (mobile)",
        }),
      });
      await load();
      Alert.alert("Uploaded", `${proofType === "PICKUP" ? "Pickup" : "Delivery"} proof saved.`);
    } catch (e) {
      Alert.alert("Upload failed", e instanceof Error ? e.message : "Try again");
    } finally {
      setBusy(null);
    }
  }

  async function verifyOtp() {
    if (!booking || !otp.trim()) return;
    setBusy("otp");
    try {
      await api(`/api/bookings/${booking.id}/verify-otp`, {
        method: "POST",
        body: JSON.stringify({ otp: otp.trim() }),
      });
      setOtp("");
      await stopBackgroundTracking();
      setTracking(false);
      await load();
      Alert.alert("Delivered", "OTP verified — job complete.");
    } catch (e) {
      Alert.alert("OTP failed", e instanceof Error ? e.message : "Incorrect code");
    } finally {
      setBusy(null);
    }
  }

  if (loading || !booking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#f59e0b" />
      </View>
    );
  }

  const active = !["DELIVERED", "CANCELLED"].includes(booking.status);
  const next = nextJobStatus(booking.status);
  const stops = parseStopsJson(booking.stopsJson);
  const hasPickupProof = booking.proofs.some((p) => p.type === "PICKUP_PROOF");
  const hasDeliveryProof = booking.proofs.some((p) => p.type === "DELIVERY_PROOF");
  const canShowOtp =
    active &&
    (booking.paymentStatus === "PAID" || booking.paymentStatus === "INVOICED") &&
    !booking.deliveryOtpVerifiedAt;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.ref}>{booking.reference}</Text>
      <Text style={styles.status}>{jobStatusLabel(booking.status)}</Text>
      <Text style={styles.price}>R {booking.estimatedPrice.toFixed(0)}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Customer</Text>
        <Text style={styles.text}>{booking.customer.fullName}</Text>
        <Text style={styles.muted}>{booking.customer.phone ?? "—"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pickup</Text>
        <Text style={styles.text}>
          {booking.pickupAddress}, {booking.pickupCity}
        </Text>
        <Pressable
          style={styles.linkBtn}
          onPress={() =>
            Linking.openURL(
              mapsDirectionsUrl(
                booking.pickupAddress,
                booking.pickupCity,
                booking.pickupLat,
                booking.pickupLng,
              ),
            )
          }
        >
          <Text style={styles.linkText}>Navigate to pickup</Text>
        </Pressable>
      </View>

      {stops.map((stop, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardTitle}>{stop.label ?? `Stop ${i + 1}`}</Text>
          <Text style={styles.text}>
            {stop.address}, {stop.city}
          </Text>
          <Pressable
            style={styles.linkBtn}
            onPress={() =>
              Linking.openURL(
                mapsDirectionsUrl(stop.address, stop.city, stop.lat, stop.lng),
              )
            }
          >
            <Text style={styles.linkText}>Navigate to stop</Text>
          </Pressable>
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Drop-off</Text>
        <Text style={styles.text}>
          {booking.dropoffAddress}, {booking.dropoffCity}
        </Text>
        <Pressable
          style={styles.linkBtn}
          onPress={() =>
            Linking.openURL(
              mapsDirectionsUrl(
                booking.dropoffAddress,
                booking.dropoffCity,
                booking.dropoffLat,
                booking.dropoffLng,
              ),
            )
          }
        >
          <Text style={styles.linkText}>Navigate to drop-off</Text>
        </Pressable>
      </View>

      {booking.cargoDescription ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cargo</Text>
          <Text style={styles.text}>{booking.cargoDescription}</Text>
        </View>
      ) : null}

      {active && (
        <View style={styles.actions}>
          {next && (
            <Pressable
              style={styles.btn}
              disabled={!!busy}
              onPress={advanceStatus}
            >
              <Text style={styles.btnText}>
                {busy === "status" ? "Updating…" : `Mark: ${jobStatusLabel(next)}`}
              </Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.btn, styles.btnSecondary]}
            disabled={!!busy}
            onPress={toggleGps}
          >
            <Text style={styles.btnTextDark}>
              {busy === "gps"
                ? "Starting…"
                : tracking
                  ? "Stop live GPS"
                  : "Start live GPS"}
            </Text>
          </Pressable>

          {!hasPickupProof && (
            <Pressable
              style={[styles.btn, styles.btnSecondary]}
              disabled={!!busy}
              onPress={() => uploadProof("PICKUP")}
            >
              <Text style={styles.btnTextDark}>
                {busy === "proof" ? "Uploading…" : "Photo: pickup proof"}
              </Text>
            </Pressable>
          )}

          {!hasDeliveryProof && (
            <Pressable
              style={[styles.btn, styles.btnSecondary]}
              disabled={!!busy}
              onPress={() => uploadProof("DELIVERY")}
            >
              <Text style={styles.btnTextDark}>
                {busy === "proof" ? "Uploading…" : "Photo: delivery proof"}
              </Text>
            </Pressable>
          )}

          {canShowOtp && (
            <View style={styles.otpBox}>
              <Text style={styles.cardTitle}>Delivery OTP</Text>
              <Text style={styles.muted}>
                Ask the customer for their delivery code to complete the job.
              </Text>
              <TextInput
                style={styles.otpInput}
                placeholder="6-digit OTP"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />
              <Pressable
                style={styles.btn}
                disabled={!!busy || otp.length < 4}
                onPress={verifyOtp}
              >
                <Text style={styles.btnText}>
                  {busy === "otp" ? "Verifying…" : "Verify OTP & complete"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {booking.status === "DELIVERED" && (
        <View style={styles.doneBox}>
          <Text style={styles.doneText}>Delivery complete</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", backgroundColor: "#020617" },
  container: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 16, paddingBottom: 40 },
  ref: { color: "#f59e0b", fontFamily: "monospace", fontSize: 14 },
  status: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 4 },
  price: { color: "#94a3b8", marginTop: 4, marginBottom: 16 },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardTitle: { color: "#f59e0b", fontSize: 12, fontWeight: "600", marginBottom: 6 },
  text: { color: "#e2e8f0", lineHeight: 20 },
  muted: { color: "#64748b", marginTop: 4, fontSize: 13 },
  linkBtn: { marginTop: 10 },
  linkText: { color: "#38bdf8", fontWeight: "600" },
  actions: { marginTop: 8, gap: 10 },
  btn: {
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  btnSecondary: { backgroundColor: "#334155" },
  btnText: { color: "#020617", fontWeight: "700" },
  btnTextDark: { color: "#fff", fontWeight: "600" },
  otpBox: {
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#0f172a",
    gap: 10,
  },
  otpInput: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    fontSize: 20,
    letterSpacing: 4,
    textAlign: "center",
  },
  doneBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#14532d",
    alignItems: "center",
  },
  doneText: { color: "#86efac", fontWeight: "700" },
});
