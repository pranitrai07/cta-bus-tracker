import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPredictions, type Prediction } from '@/services/api';
import { palette } from '@/constants/palette';
import { BackButton, Brand, InlineError, PageIntro } from '@/components/ui';

export default function ArrivalsScreen() {
  const { stopId, stopName, routeId, routeName, direction } = useLocalSearchParams<{ stopId: string; stopName?: string; routeId: string; routeName?: string; direction?: string }>();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const loadPredictions = useCallback(async (pull = false) => {
    setError('');
    if (pull) setRefreshing(true); else setLoading(true);
    try {
      setPredictions(await getPredictions(stopId, routeId));
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load bus arrivals.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [routeId, stopId]);

  useEffect(() => {
    let active = true;
    getPredictions(stopId, routeId).then((data) => {
      if (active) {
        setPredictions(data);
        setUpdatedAt(new Date());
      }
    }).catch((err: unknown) => {
      if (active) setError(err instanceof Error ? err.message : 'Could not load bus arrivals.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [routeId, stopId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadPredictions(true)} tintColor={palette.blue} colors={[palette.blue]} />}>
        <Brand /><BackButton onPress={() => router.back()} />
        <PageIntro eyebrow={`STOP ${stopId}`} title={stopName ?? 'Bus arrivals'} subtitle={[routeName ? `Route ${routeId} · ${routeName}` : `Route ${routeId}`, direction].filter(Boolean).join(' · ')} />

        <View style={styles.sectionTop}><Text style={styles.sectionTitle}>UPCOMING BUSES</Text><Pressable accessibilityRole="button" accessibilityLabel="Refresh arrivals" onPress={() => void loadPredictions(true)} style={styles.refreshButton}><Text style={styles.refreshIcon}>↻</Text><Text style={styles.refreshText}>Refresh</Text></Pressable></View>

        {updatedAt && <Text style={styles.timestamp}>Updated {updatedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>}
        {loading ? <View style={styles.loading}><ActivityIndicator color={palette.blue} /><Text style={styles.loadingText}>Checking arrivals…</Text></View>
          : error ? <InlineError message={error} onRetry={() => void loadPredictions()} />
            : predictions.length === 0 ? <View style={styles.empty}><View style={styles.emptyGlyph}><Text style={styles.emptyGlyphText}>✓</Text></View><Text style={styles.emptyTitle}>No buses on the way</Text><Text style={styles.emptyText}>There are no upcoming predictions for this stop right now. Pull down or tap refresh to check again.</Text></View>
              : <View style={styles.list}>{predictions.map((prediction, index) => <ArrivalCard key={`${prediction.vid ?? 'bus'}-${prediction.prdtm ?? index}-${index}`} prediction={prediction} />)}</View>}

        <View style={styles.note}><Text style={styles.noteMark}>i</Text><Text style={styles.noteText}>Times are estimates from CTA Bus Tracker and may change with traffic or service conditions.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ArrivalCard({ prediction }: { prediction: Prediction }) {
  const countdown = prediction.prdctdn === undefined ? undefined : Number(prediction.prdctdn);
  const minutes = countdown !== undefined && Number.isFinite(countdown) ? Math.max(0, countdown) : undefined;
  const eta = minutes === undefined ? '—' : minutes === 0 ? 'Due' : String(minutes);
  const isSoon = minutes !== undefined && minutes <= 3;

  return (
    <View style={styles.arrivalCard}>
      <View style={styles.etaBlock}><Text style={[styles.eta, isSoon && styles.etaSoon]}>{eta}</Text>{minutes !== 0 && <Text style={styles.etaUnit}>MIN</Text>}</View>
      <View style={styles.arrivalDivider} />
      <View style={styles.arrivalDetails}>
        <View style={styles.arrivalHeading}><View style={styles.routePill}><Text style={styles.routePillText}>{prediction.rt ? `#${prediction.rt}` : '#CTA'}</Text></View>{prediction.typ === 'D' && <Text style={styles.departing}>DEPARTING</Text>}{prediction.dyn && prediction.dyn !== '0' && <Text style={styles.statusTag}>SERVICE UPDATE</Text>}</View>
        <Text numberOfLines={1} style={styles.destination}>{prediction.des || 'Destination unavailable'}</Text>
        <Text numberOfLines={1} style={styles.direction}>{prediction.rtdir || prediction.rtdd || 'CTA bus'}</Text>
      </View>
      <View style={[styles.statusDot, isSoon ? styles.statusDotSoon : null]} />
    </View>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: palette.background }, content: { width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 36 },
  sectionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }, sectionTitle: { color: palette.muted, fontSize: 11, letterSpacing: 1.1, fontWeight: '800' }, refreshButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.blueLight, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 7, gap: 5 }, refreshIcon: { color: palette.blue, fontSize: 17, fontWeight: '700' }, refreshText: { color: palette.blue, fontSize: 12, fontWeight: '700' },
  timestamp: { color: palette.muted, fontSize: 11, marginTop: 11, marginBottom: 9 }, loading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 24 }, loadingText: { color: palette.secondary }, list: { gap: 10, marginTop: 13 },
  arrivalCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: palette.line, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', minHeight: 92 }, etaBlock: { width: 54, alignItems: 'center', justifyContent: 'center' }, eta: { color: palette.ink, fontSize: 26, fontWeight: '800', lineHeight: 30, letterSpacing: -0.8 }, etaSoon: { color: palette.orange }, etaUnit: { color: palette.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1 }, arrivalDivider: { width: 1, alignSelf: 'stretch', backgroundColor: palette.line, marginHorizontal: 13 }, arrivalDetails: { flex: 1, gap: 5 }, arrivalHeading: { flexDirection: 'row', alignItems: 'center', gap: 7 }, routePill: { backgroundColor: palette.blue, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3 }, routePillText: { color: '#FFF', fontSize: 10, fontWeight: '800' }, departing: { color: palette.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.7 }, statusTag: { color: palette.orange, fontSize: 8, fontWeight: '800', letterSpacing: 0.4 }, destination: { color: palette.ink, fontSize: 14, fontWeight: '700' }, direction: { color: palette.secondary, fontSize: 11 }, statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.green, marginLeft: 8 }, statusDotSoon: { backgroundColor: palette.orange },
  empty: { alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: palette.line, borderRadius: 17, paddingHorizontal: 25, paddingVertical: 28, marginTop: 14 }, emptyGlyph: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.blueLight, marginBottom: 12 }, emptyGlyphText: { color: palette.blue, fontSize: 21, fontWeight: '800' }, emptyTitle: { color: palette.ink, fontSize: 16, fontWeight: '700' }, emptyText: { color: palette.secondary, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 7 },
  note: { flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingVertical: 12, marginTop: 19, borderRadius: 12, backgroundColor: '#EDF3FA' }, noteMark: { color: palette.blue, fontWeight: '800', fontSize: 13 }, noteText: { color: palette.secondary, flex: 1, fontSize: 11, lineHeight: 16 },
});
