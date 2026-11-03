import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDirections, type Direction } from '@/services/api';
import { palette } from '@/constants/palette';
import { BackButton, Brand, InlineError, PageIntro } from '@/components/ui';

export default function DirectionScreen() {
  const { routeId, routeName } = useLocalSearchParams<{ routeId: string; routeName?: string }>();
  const [directions, setDirections] = useState<Direction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDirections() {
    setLoading(true);
    setError('');
    try { setDirections(await getDirections(routeId)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load directions.'); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    let active = true;
    getDirections(routeId).then((data) => { if (active) setDirections(data); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Could not load directions.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [routeId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Brand /><BackButton onPress={() => router.back()} />
        <PageIntro eyebrow={`ROUTE ${routeId}`} title="Which way are you going?" subtitle={routeName ? `${routeName} · Choose a direction to see its stops.` : 'Choose a direction to see its stops.'} />
        {loading ? <View style={styles.loading}><ActivityIndicator color={palette.blue} /><Text style={styles.loadingText}>Loading directions…</Text></View>
          : error ? <InlineError message={error} onRetry={() => void loadDirections()} />
            : directions.length === 0 ? <Text style={styles.empty}>No directions are currently available for this route.</Text>
              : <View style={styles.list}>{directions.map((direction) => (
                <Pressable key={direction.id} style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => router.push({ pathname: '/route/[routeId]/stops', params: { routeId, direction: direction.id, directionName: direction.name, routeName } })}>
                  <View style={styles.arrowCircle}><Text style={styles.arrow}>↗</Text></View>
                  <View style={styles.copy}><Text style={styles.name}>{direction.name}</Text><Text style={styles.caption}>Browse stops along this direction</Text></View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              ))}</View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: palette.background }, content: { width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 36 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 24 }, loadingText: { color: palette.secondary }, list: { gap: 11, marginTop: 8 }, card: { backgroundColor: '#FFF', borderColor: palette.line, borderWidth: 1, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', minHeight: 78 }, pressed: { opacity: 0.75 },
  arrowCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: palette.blueLight, alignItems: 'center', justifyContent: 'center' }, arrow: { color: palette.blue, fontSize: 20, fontWeight: '700' }, copy: { flex: 1, marginLeft: 13, gap: 4 }, name: { color: palette.ink, fontSize: 16, fontWeight: '700' }, caption: { color: palette.muted, fontSize: 12 }, chevron: { color: palette.muted, fontSize: 27, marginLeft: 8 }, empty: { color: palette.secondary, paddingVertical: 24 },
});
