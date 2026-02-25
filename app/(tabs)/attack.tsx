import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { C } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";

type AttackMode = "pixie" | "bruteforce" | "pin" | null;
type AttackStatus = "idle" | "running" | "success" | "failed" | "locked";

interface LogLine {
  id: string;
  text: string;
  type: "info" | "success" | "warn" | "error";
  time: string;
}

const PIXIE_LOGS: LogLine[] = [
  { id: "1", text: "Initiating WPS Pixie Dust attack...", type: "info", time: "00:00" },
  { id: "2", text: "Sending WPS EAPOL-Start frame", type: "info", time: "00:01" },
  { id: "3", text: "AP responded with M1 message", type: "info", time: "00:02" },
  { id: "4", text: "Received PKE, AuthKey computed", type: "info", time: "00:03" },
  { id: "5", text: "Captured E-S1 and E-S2 nonces", type: "warn", time: "00:04" },
  { id: "6", text: "Running offline brute force on nonces...", type: "info", time: "00:05" },
  { id: "7", text: "PKR reconstructed from weak RNG", type: "warn", time: "00:06" },
  { id: "8", text: "WPS PIN recovered: 12345670", type: "success", time: "00:07" },
];

const BRUTEFORCE_LOGS: LogLine[] = [
  { id: "1", text: "Starting WPS brute-force (11000 combinations)", type: "info", time: "00:00" },
  { id: "2", text: "Testing PIN: 00000010", type: "info", time: "00:01" },
  { id: "3", text: "Testing PIN: 10000000", type: "info", time: "00:02" },
  { id: "4", text: "Testing PIN: 20000008", type: "info", time: "00:03" },
  { id: "5", text: "AP rate-limiting detected — backing off 5s", type: "warn", time: "00:05" },
  { id: "6", text: "Resuming from PIN: 20000008", type: "info", time: "00:10" },
  { id: "7", text: "Testing PIN: 30000004", type: "info", time: "00:11" },
  { id: "8", text: "WPS locked after 3 failures", type: "error", time: "00:15" },
];

const PIN_LOGS: LogLine[] = [
  { id: "1", text: "Loading BSSID: C8:3A:35:12:AB:CD", type: "info", time: "00:00" },
  { id: "2", text: "Matching vendor: TP-Link", type: "info", time: "00:01" },
  { id: "3", text: "Applying Zhao algorithm...", type: "info", time: "00:02" },
  { id: "4", text: "Generated PIN: 12348670", type: "info", time: "00:02" },
  { id: "5", text: "Testing generated PIN...", type: "info", time: "00:03" },
  { id: "6", text: "Applying TpLink algorithm...", type: "info", time: "00:04" },
  { id: "7", text: "Generated PIN: 87654320", type: "info", time: "00:04" },
  { id: "8", text: "PIN match! Connected to network.", type: "success", time: "00:05" },
];

const ATTACKS = [
  {
    id: "pixie" as AttackMode,
    name: "Pixie Dust",
    icon: "snowflake" as const,
    tag: "ADVANCED",
    tagColor: C.red,
    desc: "Exploits weak random number generation in WPS handshake. Recovers PIN offline in seconds. Works on vulnerable Ralink, Broadcom, Realtek chipsets.",
    risk: "High effectiveness on unpatched routers",
    logs: PIXIE_LOGS,
    gradient: [C.red + "30", C.bg] as const,
  },
  {
    id: "bruteforce" as AttackMode,
    name: "Brute Force",
    icon: "refresh" as const,
    tag: "SLOW",
    tagColor: C.orange,
    desc: "Tests all 11,000 possible WPS PINs sequentially. Rate-limited by most routers. WPS lockout after 3 consecutive failures.",
    risk: "Moderate — triggers rate limiting",
    logs: BRUTEFORCE_LOGS,
    gradient: [C.orange + "30", C.bg] as const,
  },
  {
    id: "pin" as AttackMode,
    name: "PIN Database",
    icon: "key" as const,
    tag: "FAST",
    tagColor: C.green,
    desc: "Generates PINs using known vendor algorithms (Zhao, TpLink, ASUS, etc.). Tests most likely PINs first based on MAC address.",
    risk: "Low — only tests computed PINs",
    logs: PIN_LOGS,
    gradient: [C.cyan + "20", C.bg] as const,
  },
];

export default function AttackScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<AttackMode>(null);
  const [status, setStatus] = useState<AttackStatus>("idle");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [logIndex, setLogIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const selectAttack = (id: AttackMode) => {
    if (status === "running") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
    setStatus("idle");
    setLogs([]);
    setLogIndex(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };

  const startAttack = () => {
    if (!selected || status === "running") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const attack = ATTACKS.find(a => a.id === selected)!;
    const allLogs = attack.logs;
    setStatus("running");
    setLogs([]);
    setLogIndex(0);

    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i < allLogs.length) {
        setLogs(prev => [...prev, allLogs[i]]);
        i++;
      } else {
        clearInterval(intervalRef.current!);
        const last = allLogs[allLogs.length - 1];
        if (last.type === "success") {
          setStatus("success");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (last.type === "error") {
          setStatus("locked");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          setStatus("failed");
        }
      }
    }, 600);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatus("idle");
    setLogs([]);
    setSelected(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const logColor = (type: string) => {
    if (type === "success") return C.green;
    if (type === "warn") return C.yellow;
    if (type === "error") return C.red;
    return C.textSecondary;
  };

  const statusColor = {
    idle: C.textMuted,
    running: C.cyan,
    success: C.green,
    failed: C.orange,
    locked: C.red,
  }[status];

  const statusText = {
    idle: "IDLE",
    running: "RUNNING",
    success: "SUCCESS",
    failed: "FAILED",
    locked: "WPS LOCKED",
  }[status];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={["#080C10", "#0D1117"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.header}>
        <Text style={styles.headerLabel}>FARHAN-SHOT</Text>
        <Text style={styles.headerTitle}>Attack Modes</Text>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 80),
        }}
      >
        <View style={styles.attackGrid}>
          {ATTACKS.map(attack => (
            <TouchableOpacity
              key={attack.id}
              onPress={() => selectAttack(attack.id)}
              activeOpacity={0.8}
              disabled={status === "running"}
            >
              <View style={[
                styles.attackCard,
                selected === attack.id && {
                  borderColor: attack.tagColor + "80",
                  backgroundColor: C.bgElevated,
                }
              ]}>
                <LinearGradient
                  colors={selected === attack.id ? attack.gradient : [C.bgCard, C.bgCard]}
                  style={StyleSheet.absoluteFill}
                  borderRadius={12}
                />
                <View style={styles.attackCardInner}>
                  <View style={[styles.attackIcon, { backgroundColor: attack.tagColor + "20", borderColor: attack.tagColor + "40" }]}>
                    <Ionicons name={attack.icon} size={22} color={attack.tagColor} />
                  </View>
                  <View style={styles.attackMeta}>
                    <Text style={styles.attackName}>{attack.name}</Text>
                    <View style={[styles.attackTag, { backgroundColor: attack.tagColor + "20" }]}>
                      <Text style={[styles.attackTagText, { color: attack.tagColor }]}>{attack.tag}</Text>
                    </View>
                  </View>
                  {selected === attack.id && (
                    <Ionicons name="checkmark-circle" size={18} color={attack.tagColor} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {selected && (
          <Animated.View style={[styles.attackDetail, { opacity: fadeAnim }]}>
            {(() => {
              const attack = ATTACKS.find(a => a.id === selected)!;
              return (
                <>
                  <Text style={styles.detailDesc}>{attack.desc}</Text>
                  <View style={styles.riskRow}>
                    <Ionicons name="information-circle-outline" size={13} color={C.textMuted} />
                    <Text style={styles.riskText}>{attack.risk}</Text>
                  </View>
                </>
              );
            })()}
          </Animated.View>
        )}

        <View style={styles.controlRow}>
          <TouchableOpacity
            onPress={startAttack}
            disabled={!selected || status === "running"}
            activeOpacity={0.8}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={!selected || status === "running"
                ? [C.bgElevated, C.bgElevated]
                : [C.cyan, C.cyanDim]}
              style={styles.startBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name={status === "running" ? "timer-outline" : "play"}
                size={18}
                color={!selected || status === "running" ? C.textMuted : C.bg}
              />
              <Text style={[styles.startBtnText, { color: !selected || status === "running" ? C.textMuted : C.bg }]}>
                {status === "running" ? "Running..." : "Launch Attack"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={reset}
            style={styles.resetBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color={C.textSecondary} />
          </TouchableOpacity>
        </View>

        {logs.length > 0 && (
          <View style={styles.terminal}>
            <View style={styles.terminalHeader}>
              <View style={styles.terminalDots}>
                <View style={[styles.dot, { backgroundColor: C.red }]} />
                <View style={[styles.dot, { backgroundColor: C.yellow }]} />
                <View style={[styles.dot, { backgroundColor: C.green }]} />
              </View>
              <Text style={styles.terminalTitle}>TERMINAL OUTPUT</Text>
            </View>
            {logs.map(line => (
              <View key={line.id} style={styles.logLine}>
                <Text style={styles.logTime}>{line.time}</Text>
                <Text style={[styles.logText, { color: logColor(line.type) }]}>
                  {line.type === "success" ? "[+] " : line.type === "error" ? "[-] " : line.type === "warn" ? "[!] " : "[*] "}
                  {line.text}
                </Text>
              </View>
            ))}
            {status === "running" && (
              <View style={styles.logLine}>
                <Text style={styles.logTime}>--:--</Text>
                <Text style={[styles.logText, { color: C.cyan }]}>_</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.legalBox}>
          <Ionicons name="shield-checkmark-outline" size={14} color={C.textMuted} />
          <Text style={styles.legalText}>
            For educational use only. Only test networks you own or have explicit written permission to test. Unauthorized access to computer networks is illegal.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  headerLabel: { fontFamily: "ShareTechMono_400Regular", fontSize: 10, color: C.red, letterSpacing: 3 },
  headerTitle: { fontFamily: "Rajdhani_700Bold", fontSize: 24, color: C.text, letterSpacing: 0.5 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.bgElevated, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: C.border },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontFamily: "ShareTechMono_400Regular", fontSize: 9, letterSpacing: 1 },
  attackGrid: { gap: 10, marginBottom: 16 },
  attackCard: { borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  attackCardInner: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  attackIcon: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  attackMeta: { flex: 1, gap: 4 },
  attackName: { fontFamily: "Rajdhani_700Bold", fontSize: 17, color: C.text, letterSpacing: 0.3 },
  attackTag: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  attackTagText: { fontFamily: "ShareTechMono_400Regular", fontSize: 9, letterSpacing: 1 },
  attackDetail: { backgroundColor: C.bgCard, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 16 },
  detailDesc: { fontFamily: "Rajdhani_400Regular", fontSize: 14, color: C.textSecondary, lineHeight: 20, marginBottom: 10 },
  riskRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  riskText: { fontFamily: "ShareTechMono_400Regular", fontSize: 10, color: C.textMuted },
  controlRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 10 },
  startBtnText: { fontFamily: "Rajdhani_700Bold", fontSize: 15, letterSpacing: 0.5 },
  resetBtn: { width: 50, backgroundColor: C.bgElevated, borderRadius: 10, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" },
  terminal: { backgroundColor: "#0A0E13", borderRadius: 10, borderWidth: 1, borderColor: "#1E2430", padding: 14, marginBottom: 16 },
  terminalHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  terminalDots: { flexDirection: "row", gap: 5 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  terminalTitle: { fontFamily: "ShareTechMono_400Regular", fontSize: 9, color: C.textMuted, letterSpacing: 2 },
  logLine: { flexDirection: "row", gap: 10, marginBottom: 4 },
  logTime: { fontFamily: "ShareTechMono_400Regular", fontSize: 10, color: C.textMuted, width: 32 },
  logText: { fontFamily: "ShareTechMono_400Regular", fontSize: 11, flex: 1, lineHeight: 16 },
  legalBox: { flexDirection: "row", gap: 8, alignItems: "flex-start", backgroundColor: C.bgCard, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: C.border },
  legalText: { fontFamily: "Rajdhani_400Regular", fontSize: 12, color: C.textMuted, flex: 1, lineHeight: 18 },
});
