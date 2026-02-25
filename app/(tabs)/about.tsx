import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { C } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";

function LinkRow({ icon, label, value, url }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; url?: string }) {
  const handlePress = () => {
    if (!url) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={url ? 0.7 : 1}
      style={styles.linkRow}
      disabled={!url}
    >
      <View style={styles.linkIcon}>
        <Ionicons name={icon} size={16} color={C.cyan} />
      </View>
      <View style={styles.linkContent}>
        <Text style={styles.linkLabel}>{label}</Text>
        <Text style={[styles.linkValue, url && { color: C.cyan }]}>{value}</Text>
      </View>
      {url && <Ionicons name="open-outline" size={14} color={C.textMuted} />}
    </TouchableOpacity>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Feature({ icon, label, desc }: { icon: keyof typeof Ionicons.glyphMap; label: string; desc: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={15} color={C.greenDim} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureLabel}>{label}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={["#080C10", "#0D1117"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 80),
        }}
      >
        <View style={styles.hero}>
          <LinearGradient
            colors={[C.cyan + "20", C.bg]}
            style={StyleSheet.absoluteFill}
            borderRadius={16}
          />
          <View style={styles.heroIcon}>
            <LinearGradient
              colors={[C.cyan, C.cyanDim]}
              style={styles.heroIconGrad}
            >
              <Ionicons name="wifi" size={32} color={C.bg} />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>WPS Tester</Text>
          <Text style={styles.appVersion}>Enhanced Edition — v2.0.0</Text>
          <Text style={styles.appTagline}>Advanced WiFi WPS/WPA Security Tester</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionBadgeText}>Android 7.0+  •  Root Required</Text>
          </View>
        </View>

        <Section title="DEVELOPER">
          <LinkRow
            icon="person"
            label="Developer"
            value="Farhan Muh Tasim"
          />
          <View style={styles.divider} />
          <LinkRow
            icon="logo-github"
            label="GitHub"
            value="github.com/Gtajisan"
            url="https://github.com/Gtajisan"
          />
        </Section>

        <Section title="ATTRIBUTION">
          <LinkRow
            icon="code-slash"
            label="Base Inspired From"
            value="StrykerApp"
            url="https://github.com/Stryker-Defense-Inc/strykerapp"
          />
          <View style={styles.divider} />
          <LinkRow
            icon="flash"
            label="Enhanced Using"
            value="FARHAN-Shot"
            url="https://github.com/Porter-union-rom-updates/FARHAN-Shot"
          />
          <View style={styles.divider} />
          <LinkRow
            icon="wifi"
            label="Base Repository"
            value="wifi-wps-wpa-tester-opensource"
            url="https://github.com/Gtajisan/wifi-wps-wpa-tester-opensource"
          />
        </Section>

        <Section title="FEATURES">
          <Feature
            icon="wifi"
            label="WiFi Network Scanner"
            desc="Scan and analyze nearby access points with WPS vulnerability detection"
          />
          <View style={styles.divider} />
          <Feature
            icon="snowflake"
            label="Pixie Dust Attack"
            desc="Exploit weak nonce generation on unpatched routers (FARHAN-Shot)"
          />
          <View style={styles.divider} />
          <Feature
            icon="key"
            label="PIN Algorithm Database"
            desc="18 vendor-specific algorithms: Zhao, TpLink, ASUS, D-Link, and more"
          />
          <View style={styles.divider} />
          <Feature
            icon="refresh"
            label="Brute Force Mode"
            desc="Sequential PIN testing with rate-limit bypass and WPS lock detection"
          />
          <View style={styles.divider} />
          <Feature
            icon="server"
            label="WPS PIN Database"
            desc="Pre-computed known default PINs for common routers"
          />
        </Section>

        <Section title="REQUIREMENTS">
          <View style={styles.reqRow}>
            <Ionicons name="phone-portrait" size={14} color={C.textMuted} />
            <Text style={styles.reqText}>Android 7.0 (Nougat) or higher</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.reqRow}>
            <MaterialCommunityIcons name="lock-open" size={14} color={C.orange} />
            <Text style={styles.reqText}>Root access required for WPS testing</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.reqRow}>
            <Ionicons name="location" size={14} color={C.textMuted} />
            <Text style={styles.reqText}>Location permission (for WiFi scanning)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.reqRow}>
            <Ionicons name="library" size={14} color={C.textMuted} />
            <Text style={styles.reqText}>WpsConnectionLibrary via JitPack</Text>
          </View>
        </Section>

        <View style={styles.legalCard}>
          <View style={styles.legalHeader}>
            <Ionicons name="shield" size={16} color={C.yellow} />
            <Text style={styles.legalTitle}>LEGAL DISCLAIMER</Text>
          </View>
          <Text style={styles.legalText}>
            This application is developed for educational purposes only. The developer assumes no liability for any misuse of this software.{"\n\n"}
            You are solely responsible for ensuring that your use of this app complies with all applicable local, state, national, and international laws and regulations.{"\n\n"}
            Only test networks that you own or have received explicit written permission to test. Unauthorized access to computer networks is illegal and may result in criminal prosecution.
          </Text>
        </View>

        <Text style={styles.footer}>
          © 2024 Farhan Muh Tasim (Gtajisan){"\n"}Open Source — Educational Use Only
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  hero: {
    alignItems: "center",
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 20,
    marginTop: 8,
    overflow: "hidden",
  },
  heroIcon: { marginBottom: 14 },
  heroIconGrad: { width: 70, height: 70, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  appName: { fontFamily: "Rajdhani_700Bold", fontSize: 28, color: C.text, letterSpacing: 1 },
  appVersion: { fontFamily: "ShareTechMono_400Regular", fontSize: 10, color: C.cyan, marginTop: 4, letterSpacing: 1 },
  appTagline: { fontFamily: "Rajdhani_400Regular", fontSize: 14, color: C.textSecondary, marginTop: 6, textAlign: "center" },
  versionBadge: { marginTop: 12, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: C.bgElevated, borderRadius: 20, borderWidth: 1, borderColor: C.border },
  versionBadgeText: { fontFamily: "ShareTechMono_400Regular", fontSize: 9, color: C.textMuted, letterSpacing: 1 },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: "ShareTechMono_400Regular", fontSize: 10, color: C.cyan, letterSpacing: 3, marginBottom: 8, paddingLeft: 2 },
  sectionCard: { backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  linkRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  linkIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.bgElevated, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  linkContent: { flex: 1 },
  linkLabel: { fontFamily: "ShareTechMono_400Regular", fontSize: 9, color: C.textMuted, letterSpacing: 1, marginBottom: 2 },
  linkValue: { fontFamily: "Rajdhani_600SemiBold", fontSize: 15, color: C.text },
  divider: { height: 1, backgroundColor: C.border, marginLeft: 58 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", padding: 14, gap: 12 },
  featureIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.bgElevated, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  featureLabel: { fontFamily: "Rajdhani_600SemiBold", fontSize: 14, color: C.text, letterSpacing: 0.3 },
  featureDesc: { fontFamily: "Rajdhani_400Regular", fontSize: 12, color: C.textSecondary, lineHeight: 18 },
  reqRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  reqText: { fontFamily: "Rajdhani_400Regular", fontSize: 14, color: C.textSecondary, flex: 1 },
  legalCard: { backgroundColor: "#160F00", borderRadius: 12, borderWidth: 1, borderColor: C.yellow + "40", padding: 16, marginBottom: 20 },
  legalHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  legalTitle: { fontFamily: "ShareTechMono_400Regular", fontSize: 10, color: C.yellow, letterSpacing: 2 },
  legalText: { fontFamily: "Rajdhani_400Regular", fontSize: 13, color: C.textSecondary, lineHeight: 20 },
  footer: { textAlign: "center", fontFamily: "ShareTechMono_400Regular", fontSize: 9, color: C.textMuted, lineHeight: 16, letterSpacing: 0.5, marginBottom: 8 },
});
