import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '@/constants/palette';

export function Brand() {
  return (
    <View style={styles.brandRow}>
      <View style={styles.brandMark}><Text style={styles.brandBus}>▰</Text><View style={styles.brandWheelOne} /><View style={styles.brandWheelTwo} /></View>
      <Text style={styles.brandName}>CTA <Text style={styles.brandWeight}>BUS TRACKER</Text></Text>
    </View>
  );
}

export function BackButton({ onPress }: { onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.65 }]}><Text style={styles.backArrow}>‹</Text><Text style={styles.backLabel}>Back</Text></Pressable>;
}

export function PageIntro({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <View style={styles.intro}><Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View>;
}

export function SectionHeading({ title, detail }: { title: string; detail: string }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionDetail}>{detail}</Text></View>;
}

export function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <View style={styles.error}><Text style={styles.errorTitle}>We couldn’t reach the tracker</Text><Text style={styles.errorMessage}>{message}</Text><Pressable onPress={onRetry} style={({ pressed }) => [styles.retry, pressed && { opacity: 0.7 }]}><Text style={styles.retryText}>Try again</Text></Pressable></View>;
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 11 },
  brandMark: { width: 31, height: 27, borderRadius: 7, backgroundColor: palette.blue, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  brandBus: { color: '#FFF', fontSize: 15, lineHeight: 18, fontWeight: '900', transform: [{ scaleX: 1.3 }] },
  brandWheelOne: { position: 'absolute', bottom: 3, left: 6, width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFF' },
  brandWheelTwo: { position: 'absolute', bottom: 3, right: 6, width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFF' },
  brandName: { color: palette.blue, fontSize: 12, fontWeight: '900', letterSpacing: 1.1 }, brandWeight: { color: palette.ink, fontWeight: '700' },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 20, paddingVertical: 4, paddingRight: 10 }, backArrow: { color: palette.blue, fontSize: 29, lineHeight: 30, marginTop: -2 }, backLabel: { color: palette.blue, fontSize: 13, fontWeight: '700' },
  intro: { marginTop: 22, marginBottom: 24 }, eyebrow: { color: palette.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginBottom: 8 }, title: { color: palette.ink, fontSize: 29, fontWeight: '800', letterSpacing: -0.7 }, subtitle: { color: palette.secondary, fontSize: 14, lineHeight: 20, marginTop: 8 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: palette.muted, fontSize: 11, letterSpacing: 1.1, fontWeight: '800' }, sectionDetail: { color: palette.muted, fontSize: 11 },
  error: { padding: 18, marginTop: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F1D8CC', borderRadius: 15 }, errorTitle: { color: palette.ink, fontSize: 15, fontWeight: '700' }, errorMessage: { color: palette.secondary, marginTop: 6, fontSize: 13, lineHeight: 19 }, retry: { alignSelf: 'flex-start', marginTop: 13, backgroundColor: palette.blue, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 9 }, retryText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: '#FFF', borderColor: palette.line, borderWidth: 1, borderRadius: 16, padding: 16 },
});
