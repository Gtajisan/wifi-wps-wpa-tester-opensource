import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { C } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";

interface Network {
  id: string;
  ssid: string;
  bssid: string;
  signal: number;
  security: string;
  channel: number;
  frequency: string;
  wpsEnabled: boolean;
  wpsLocked: boolean;
  vendor: string;
  vulnerable: boolean;
}

const MOCK_NETWORKS: Network[] = [
  {
    id: "1", ssid: "HOME-WIFI-2G", bssid: "C8:3A:35:12:AB:CD",
    signal: -45, security: "WPA2", channel: 6, frequency: "2.4 GHz",
    wpsEnabled: true, wpsLocked: false, vendor: "TP-Link", vulnerable: true,
  },
  {
    id: "2", ssid: "AndroidAP_5G", bssid: "D4:6A:6A:99:01:EF",
    signal: -62, security: "WPA2/WPA3", channel: 36, frequency: "5.0 GHz",
    wpsEnabled: false, wpsLocked: false, vendor: "Samsung", vulnerable: false,
  },
  {
    id: "3", ssid: "DIRECT-XY-DeviceABC", bssid: "FA:8F:CA:23:44:BC",
    signal: -71, security: "WPA2", channel: 11, frequency: "2.4 GHz",
    wpsEnabled: true, wpsLocked: true, vendor: "D-Link", vulnerable: false,
  },
  {
    id: "4", ssid: "Vodafone-4A2B", bssid: "00:26:44:7B:EE:11",
    signal: -55, security: "WPA2", channel: 1, frequency: "2.4 GHz",
    wpsEnabled: true, wpsLocked: false, vendor: "Huawei", vulnerable: true,
  },
  {
    id: "5", ssid: "Office_Network", bssid: "B0:BE:76:11:22:33",
    signal: -80, security: "WPA2-Enterprise", channel: 149, frequency: "5.0 GHz",
    wpsEnabled: false, wpsLocked: false, vendor: "Cisco", vulnerable: false,
  },
  {
    id: "6", ssid: "ASUS_RT-N56U", bssid: "2C:56:DC:00:AB:CD",
    signal: -68, security: "WPA2", channel: 6, frequency: "2.4 GHz",
    wpsEnabled: true, wpsLocked: false, vendor: "ASUS", vulnerable: true,
  },
  {
    id: "7", ssid: "Linksys00423", bssid: "20:AA:4B:DD:EE:FF",
    signal: -74, security: "WPA", channel: 11, frequency: "2.4 GHz",
    wpsEnabled: true, wpsLocked: false, vendor: "Linksys", vulnerable: true,
  },
];

function signalBars(signal: number): number {
  if (signal >= -50) return 4;
  if (signal >= -65) return 3;
  if (signal >= -75) return 2;
  return 1;
}

function SignalIcon({ signal }: { signal: number }) {
  const bars = signalBars(signal);
  const color = bars >= 3 ? C.green : bars === 2 ? C.yellow : C.red;
  const names: ("wifi" | "wifi-strength-1" | "wifi-strength-2" | "wifi-strength-3" | "wifi-strength-4")[] =
    ["wifi-strength-1", "wifi-strength-2", "wifi-strength-3", "wifi-strength-4"];
  return (
    <MaterialCommunityIcons
      name={names[Math.max(0, bars - 1)]}
      size={20}
      color={color}
    />
  );
}

function NetworkCard({ item, onPress }: { item: Network; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <View style={styles.networkCard}>
          <View style={styles.networkLeft}>
            <View style={styles.signalContainer}>
              <SignalIcon signal={item.signal} />
            </View>
            <View style={styles.networkInfo}>
              <Text style={styles.ssid} numberOfLines={1}>{item.ssid}</Text>
              <Text style={styles.bssid}>{item.bssid}</Text>
              <View style={styles.tags}>
                <View style={[styles.tag, { borderColor: C.border }]}>
                  <Text style={styles.tagText}>{item.security}</Text>
                </View>
                <View style={[styles.tag, { borderColor: C.border }]}>
                  <Text style={styles.tagText}>{item.frequency}</Text>
                </View>
                {item.wpsEnabled && (
                  <View style={[styles.tag, item.wpsLocked
                    ? { borderColor: C.textMuted }
                    : { borderColor: C.cyan }]}>
                    <Text style={[styles.tagText, !item.wpsLocked && { color: C.cyan }]}>
                      WPS{item.wpsLocked ? " LOCKED" : ""}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.networkRight}>
            {item.vulnerable && (
              <View style={styles.vulnBadge}>
                <Ionicons name="warning" size={10} color={C.orange} />
                <Text style={styles.vulnText}>VULN</Text>
              </View>
            )}
            <Text style={styles.dbm}>{item.signal} dBm</Text>
            <Text style={styles.vendor}>{item.vendor}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const [scanning, setScanning] = useState(false);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [scanned, setScanned] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  const startPulse = () => {
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulseRef.current.start();
  };

  const stopPulse = () => {
    pulseRef.current?.stop();
    pulseAnim.setValue(1);
  };

  const doScan = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanning(true);
    setNetworks([]);
    startPulse();
    setTimeout(() => {
      setNetworks(MOCK_NETWORKS.sort((a, b) => b.signal - a.signal));
      setScanning(false);
      setScanned(true);
      stopPulse();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2800);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 1500);
  }, []);

  const vulnerable = networks.filter(n => n.vulnerable).length;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={["#080C10", "#0D1117"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>WPS TESTER</Text>
          <Text style={styles.headerTitle}>Network Scanner</Text>
        </View>
        {scanned && (
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{networks.length}</Text>
              <Text style={styles.statLabel}>FOUND</Text>
            </View>
            <View style={[styles.stat, { marginLeft: 16 }]}>
              <Text style={[styles.statNum, { color: C.orange }]}>{vulnerable}</Text>
              <Text style={styles.statLabel}>VULN</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.scanButtonContainer}>
        <TouchableOpacity
          onPress={doScan}
          disabled={scanning}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.scanButton, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={scanning ? [C.cyanDim, "#006680"] : [C.cyan, C.cyanDim]}
              style={styles.scanButtonGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {scanning ? (
                <ActivityIndicator color={C.bg} size="large" />
              ) : (
                <Ionicons name="wifi" size={36} color={C.bg} />
              )}
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
        <Text style={styles.scanHint}>
          {scanning ? "Scanning networks..." : scanned ? "Tap to rescan" : "Tap to start scan"}
        </Text>
        {scanning && (
          <Text style={styles.scanSub}>Detecting WPS-enabled networks</Text>
        )}
      </View>

      {networks.length > 0 && (
        <FlatList
          data={networks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <NetworkCard item={item} onPress={() => {}} />
          )}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!networks.length}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.cyan}
              colors={[C.cyan]}
            />
          }
        />
      )}

      {scanned && networks.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="wifi-outline" size={48} color={C.textMuted} />
          <Text style={styles.emptyText}>No networks detected</Text>
          <Text style={styles.emptySubtext}>Move closer to WiFi access points</Text>
        </View>
      )}

      <View style={[styles.disclaimer, { bottom: insets.bottom + (Platform.OS === "web" ? 84 : 60) }]}>
        <Text style={styles.disclaimerText}>Educational use only. Test only with permission.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerLabel: {
    fontFamily: "ShareTechMono_400Regular",
    fontSize: 10,
    color: C.cyan,
    letterSpacing: 3,
  },
  headerTitle: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 24,
    color: C.text,
    letterSpacing: 0.5,
  },
  statsRow: { flexDirection: "row", alignItems: "center" },
  stat: { alignItems: "center" },
  statNum: { fontFamily: "Rajdhani_700Bold", fontSize: 20, color: C.cyan },
  statLabel: { fontFamily: "ShareTechMono_400Regular", fontSize: 9, color: C.textSecondary, letterSpacing: 1 },
  scanButtonContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  scanButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: C.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  scanButtonGrad: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanHint: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: 14,
    color: C.textSecondary,
    letterSpacing: 0.5,
  },
  scanSub: {
    fontFamily: "ShareTechMono_400Regular",
    fontSize: 10,
    color: C.cyanDim,
    marginTop: 4,
    letterSpacing: 1,
  },
  list: { flex: 1 },
  networkCard: {
    backgroundColor: C.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  networkLeft: { flexDirection: "row", flex: 1 },
  signalContainer: { marginRight: 12, paddingTop: 2 },
  networkInfo: { flex: 1 },
  ssid: { fontFamily: "Rajdhani_700Bold", fontSize: 16, color: C.text, letterSpacing: 0.3 },
  bssid: { fontFamily: "ShareTechMono_400Regular", fontSize: 10, color: C.textSecondary, marginTop: 2 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 8 },
  tag: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: { fontFamily: "ShareTechMono_400Regular", fontSize: 9, color: C.textSecondary, letterSpacing: 0.5 },
  networkRight: { alignItems: "flex-end", gap: 4 },
  vulnBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,107,53,0.15)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
    borderWidth: 1,
    borderColor: "rgba(255,107,53,0.3)",
  },
  vulnText: { fontFamily: "ShareTechMono_400Regular", fontSize: 8, color: C.orange, letterSpacing: 1 },
  dbm: { fontFamily: "ShareTechMono_400Regular", fontSize: 10, color: C.textMuted },
  vendor: { fontFamily: "Rajdhani_400Regular", fontSize: 12, color: C.textSecondary },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyText: { fontFamily: "Rajdhani_600SemiBold", fontSize: 16, color: C.textSecondary },
  emptySubtext: { fontFamily: "ShareTechMono_400Regular", fontSize: 11, color: C.textMuted },
  disclaimer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  disclaimerText: {
    fontFamily: "ShareTechMono_400Regular",
    fontSize: 9,
    color: C.textMuted,
    letterSpacing: 0.5,
  },
});
