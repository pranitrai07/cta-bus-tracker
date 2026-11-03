import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStops, type BusStop } from '@/services/api';
import { palette } from '@/constants/palette';
import { BackButton, Brand, InlineError, PageIntro } from '@/components/ui';

export default function StopListScreen() {
  const { routeId, direction, directionName, routeName } = useLocalSearchParams<{ routeId: string; direction: string; directionName?: string; routeName?: string }>();
  const [stops, setStops] = useState<BusStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadStops() {
    setLoading(true);
    setError('');
    try { setStops(await getStops(routeId, direction)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load stops.'); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    let active = true;
    getStops(routeId, direction).then((data) => { if (active) setStops(data); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Could not load stops.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [routeId, direction]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Brand /><BackButton onPress={() => router.back()} />
        <PageIntro eyebrow={`${routeName ? `${routeName} · ` : ''}${directionName ?? direction}`} title="Choose your stop" subtitle="Select a stop to see upcoming bus arrivals." />
        {loading ? <View style={styles.loading}><ActivityIndicator color={palette.blue} /><Text style={styles.loadingText}>Loading stops…</Text></View>
          : error ? <InlineError message={error} onRetry={() => void loadStops()} />
            : stops.length === 0 ? <Text style={styles.empty}>No stops are currently listed for this direction.</Text>
              : <View style={styles.list}>{stops.map((stop, index) => (
                <Pressable key={stop.stpid} onPress={() => router.push({ pathname: '/stop/[stopId]', params: { stopId: stop.stpid, stopName: stop.stpnm, routeId, routeName, direction: directionName ?? direction } })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                  <View style={styles.stopIndex}><Text style={styles.stopIndexText}>{String(index + 1).padStart(2, '0')}</Text></View>
                  <View style={styles.copy}><Text style={styles.name}>{stop.stpnm}</Text><Text style={styles.id}>STOP ID {stop.stpid}</Text></View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              ))}</View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: palette.background }, content: { width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 36 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 24 }, loadingText: { color: palette.secondary }, list: { gap: 9, marginTop: 8 },
  card: { backgroundColor: '#FFF', borderColor: palette.line, borderWidth: 1, borderRadius: 15, paddingHorizontal: 13, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', minHeight: 72 }, pressed: { opacity: 0.75 },
  stopIndex: { backgroundColor: palette.blueLight, width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, stopIndexText: { color: palette.blue, fontSize: 12, fontWeight: '800' }, copy: { flex: 1, marginLeft: 13, gap: 5 }, name: { color: palette.ink, fontSize: 14, fontWeight: '700' }, id: { color: palette.muted, fontSize: 10, letterSpacing: 0.9, fontWeight: '700' }, chevron: { color: palette.muted, fontSize: 27, marginLeft: 8 }, empty: { color: palette.secondary, paddingVertical: 24 },
});
