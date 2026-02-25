import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Platform,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { C } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";

interface Algorithm {
  id: string;
  name: string;
  vendor: string;
  method: string;
  pin?: string;
  description: string;
  success: number;
  color: string;
}

const ALL_ALGORITHMS: Algorithm[] = [
  { id: "1", name: "Zhao", vendor: "TP-Link / Linksys", method: "PIN Generation", description: "Uses last 3 octets of BSSID. Most common algorithm. 82% success on vulnerable routers.", success: 82, color: C.cyan },
  { id: "2", name: "TpLink", vendor: "TP-Link", method: "PIN Generation", description: "Specific to TP-Link devices. Derives from BSSID with XOR operations.", success: 74, color: C.green },
  { id: "3", name: "Dlink", vendor: "D-Link", method: "PIN Generation", description: "D-Link proprietary PIN generation from MAC address bytes.", success: 68, color: C.yellow },
  { id: "4", name: "DlinkNIC", vendor: "D-Link NIC", method: "PIN Generation", description: "Alternative D-Link algorithm for NIC-branded routers.", success: 61, color: C.yellow },
  { id: "5", name: "Arris", vendor: "Arris / Motorola", method: "PIN Generation", description: "Arris cable modems. PIN derived from serial number prefix.", success: 55, color: C.orange },
  { id: "6", name: "ASUS", vendor: "ASUS", method: "PIN Generation", description: "ASUS PIN from BSSID: specific byte manipulation formula.", success: 71, color: C.cyan },
  { id: "7", name: "Belkin", vendor: "Belkin", method: "PIN Generation", description: "Belkin routers use lowercase MAC address arithmetic.", success: 49, color: C.textSecondary },
  { id: "8", name: "Netgear", vendor: "Netgear", method: "PIN Generation", description: "BSSID-based with Netgear-specific byte transforms.", success: 58, color: C.textSecondary },
  { id: "9", name: "Pixie Dust", vendor: "Multiple", method: "Pixie Dust Attack", description: "Exploits weak nonce generation in WPS handshake. Recovers PIN offline in seconds on vulnerable firmware.", success: 91, color: C.red },
  { id: "10", name: "Brute Force", vendor: "Any WPS", method: "Brute Force", description: "Sequential PIN testing. 11000 combinations max (checksum). Rate-limited by device after 3 attempts.", success: 30, color: C.orange },
  { id: "11", name: "Static PINs", vendor: "Multiple", method: "Static PIN Database", description: "Known default PINs shipped with routers. Tested first before algorithmic generation.", success: 44, color: C.green },
  { id: "12", name: "Brcm1", vendor: "Broadcom", method: "PIN Generation", description: "Broadcom chipset PIN from MAC. Affects many Netgear/Belkin devices.", success: 63, color: C.textSecondary },
  { id: "13", name: "Brcm2", vendor: "Broadcom v2", method: "PIN Generation", description: "Updated Broadcom algorithm variant.", success: 57, color: C.textSecondary },
  { id: "14", name: "Brcm3", vendor: "Broadcom v3", method: "PIN Generation", description: "Third Broadcom variant for later chipset revisions.", success: 51, color: C.textSecondary },
  { id: "15", name: "ComtrEnd", vendor: "Comtrend", method: "PIN Generation", description: "Comtrend DSL modem PIN formula.", success: 42, color: C.textMuted },
  { id: "16", name: "OnlimeRU", vendor: "Onlime ISP", method: "Static PIN", description: "Russian ISP Onlime-issued router default PIN pattern.", success: 38, color: C.textMuted },
  { id: "17", name: "EircomD", vendor: "Eircom", method: "PIN Generation", description: "Eircom/Meteor Ireland DSL routers.", success: 35, color: C.textMuted },
  { id: "18", name: "Sagem", vendor: "Sagem", method: "PIN Generation", description: "Sagem DSL modem WPS PIN derivation.", success: 33, color: C.textMuted },
];

const SECTION_ORDER = ["Pixie Dust Attack", "Brute Force", "PIN Generation", "Static PIN Database"];
const METHOD_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "Pixie Dust Attack": "flash",
  "Brute Force": "reload",
  "PIN Generation": "key",
  "Static PIN Database": "server",
};

export default function AlgorithmsScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = search.trim()
    ? ALL_ALGORITHMS.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.vendor.toLowerCase().includes(search.toLowerCase())
      )
    : ALL_ALGORITHMS;

  const grouped = SECTION_ORDER.reduce<{ title: string; data: Algorithm[] }[]>((acc, method) => {
    const items = filtered.filter(a => a.method === method);
    if (items.length > 0) acc.push({ title: method, data: items });
    return acc;
  }, []);

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(prev => prev === id ? null : id);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={["#080C10", "#0D1117"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.header}>
        <Text style={styles.headerLabel}>DATABASE</Text>
        <Text style={styles.headerTitle}>WPS Algorithms</Text>
        <Text style={styles.headerSub}>{ALL_ALGORITHMS.length} attack vectors loaded</Text>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={C.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search algorithm or vendor..."
          placeholderTextColor={C.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={C.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <SectionList
        sections={grouped}
        keyExtractor={item => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 80),
        }}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Ionicons name={METHOD_ICONS[title] ?? "key"} size={14} color={C.cyan} />
            <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isOpen = expanded === item.id;
          return (
            <TouchableOpacity
              onPress={() => toggle(item.id)}
              activeOpacity={0.8}
              style={[styles.algCard, isOpen && { borderColor: item.color + "60" }]}
            >
              <View style={styles.algTop}>
                <View style={styles.algLeft}>
                  <Text style={[styles.algName, { color: item.color }]}>{item.name}</Text>
                  <Text style={styles.algVendor}>{item.vendor}</Text>
                </View>
                <View style={styles.algRight}>
                  <View style={styles.successRow}>
                    <Text style={[styles.successPct, {
                      color: item.success >= 70 ? C.green : item.success >= 50 ? C.yellow : C.textSecondary
                    }]}>{item.success}%</Text>
                    <Text style={styles.successLabel}>rate</Text>
                  </View>
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={14}
                    color={C.textMuted}
                  />
                </View>
              </View>
              {isOpen && (
                <View style={styles.algExpanded}>
                  <View style={styles.divider} />
                  <Text style={styles.algDesc}>{item.description}</Text>
                  <View style={styles.successBar}>
                    <View style={[styles.successFill, {
                      width: `${item.success}%`,
                      backgroundColor: item.success >= 70 ? C.green : item.success >= 50 ? C.yellow : C.orange,
                    }]} />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerLabel: { fontFamily: "ShareTechMono_400Regular", fontSize: 10, color: C.cyan, letterSpacing: 3 },
  headerTitle: { fontFamily: "Rajdhani_700Bold", fontSize: 24, color: C.text, letterSpacing: 0.5 },
  headerSub: { fontFamily: "ShareTechMono_400Regular", fontSize: 10, color: C.textMuted, marginTop: 2 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.bgElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Rajdhani_400Regular",
    fontSize: 15,
    color: C.text,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: "ShareTechMono_400Regular",
    fontSize: 10,
    color: C.cyan,
    letterSpacing: 2,
  },
  algCard: {
    backgroundColor: C.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 8,
  },
  algTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  algLeft: { flex: 1 },
  algName: { fontFamily: "Rajdhani_700Bold", fontSize: 16, letterSpacing: 0.5 },
  algVendor: { fontFamily: "ShareTechMono_400Regular", fontSize: 10, color: C.textSecondary, marginTop: 2 },
  algRight: { alignItems: "flex-end", gap: 4 },
  successRow: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  successPct: { fontFamily: "Rajdhani_700Bold", fontSize: 18 },
  successLabel: { fontFamily: "ShareTechMono_400Regular", fontSize: 9, color: C.textMuted },
  algExpanded: { marginTop: 10 },
  divider: { height: 1, backgroundColor: C.border, marginBottom: 10 },
  algDesc: { fontFamily: "Rajdhani_400Regular", fontSize: 14, color: C.textSecondary, lineHeight: 20 },
  successBar: {
    height: 3,
    backgroundColor: C.bgElevated,
    borderRadius: 2,
    marginTop: 10,
    overflow: "hidden",
  },
  successFill: { height: 3, borderRadius: 2 },
});
