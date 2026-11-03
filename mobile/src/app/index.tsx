import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRoutes, type BusRoute } from '@/services/api';
import { palette } from '@/constants/palette';
import { Brand, InlineError, SectionHeading } from '@/components/ui';

export default function RouteSearchScreen() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadRoutes() {
    setLoading(true);
    setError('');
    try { setRoutes(await getRoutes()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load CTA routes.'); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    let active = true;
    getRoutes().then((data) => { if (active) setRoutes(data); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Could not load CTA routes.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredRoutes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return routes;
    return routes.filter((route) => route.rt.toLowerCase().includes(normalized) || route.rtnm.toLowerCase().includes(normalized));
  }, [query, routes]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Brand />
        <View style={styles.hero}>
          <View style={styles.eyebrow}><View style={styles.liveDot} /><Text style={styles.eyebrowText}>CHICAGO BUS ARRIVALS</Text></View>
          <Text style={styles.title}>Catch the next{'\n'}bus.</Text>
          <Text style={styles.subtitle}>Choose a route to find your stop and see live arrival estimates.</Text>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput accessibilityLabel="Search CTA routes" autoCapitalize="none" autoCorrect={false} onChangeText={setQuery} placeholder="Search route number or name" placeholderTextColor={palette.muted} returnKeyType="search" style={styles.searchInput} value={query} />
          {query.length > 0 && <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')}><Text style={styles.clear}>×</Text></Pressable>}
        </View>

        <SectionHeading title="BUS ROUTES" detail={loading ? 'Loading' : `${filteredRoutes.length} routes`} />

        {loading ? <View style={styles.loading}><ActivityIndicator color={palette.blue} /><Text style={styles.loadingText}>Loading CTA routes…</Text></View>
          : error ? <InlineError message={error} onRetry={() => void loadRoutes()} />
            : filteredRoutes.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>No routes found</Text><Text style={styles.emptyText}>Try a route number such as 20 or a street name.</Text></View>
              : <View style={styles.routeList}>{filteredRoutes.map((route) => (
                <Pressable accessibilityRole="button" key={route.rt} onPress={() => router.push({ pathname: '/route/[routeId]', params: { routeId: route.rt, routeName: route.rtnm } })} style={({ pressed }) => [styles.routeCard, pressed && styles.pressed]}>
                  <View style={[styles.routeBadge, { backgroundColor: route.rtclr && /^#[0-9a-fA-F]{6}$/.test(route.rtclr) ? route.rtclr : palette.blue }]}><Text style={[styles.routeNumber, { color: route.rtclr?.toLowerCase() === '#ffffff' ? palette.ink : '#FFFFFF' }]}>{route.rt}</Text></View>
                  <View style={styles.routeInfo}><Text numberOfLines={1} style={styles.routeName}>{route.rtnm}</Text><Text style={styles.routeHint}>View directions and stops</Text></View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              ))}</View>}

        <Text style={styles.footer}>Arrival estimates are provided by CTA Bus Tracker.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background }, content: { width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 36 }, hero: { marginTop: 34, marginBottom: 24 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }, liveDot: { height: 8, width: 8, borderRadius: 4, backgroundColor: palette.green }, eyebrowText: { color: palette.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: palette.ink, fontSize: 42, fontWeight: '800', lineHeight: 46, letterSpacing: -1.4 }, subtitle: { color: palette.secondary, fontSize: 15, lineHeight: 22, marginTop: 12, maxWidth: 360 },
  searchBox: { minHeight: 56, backgroundColor: '#FFFFFF', borderColor: palette.line, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 30, shadowColor: '#1D3553', shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 1 }, searchIcon: { fontSize: 27, color: palette.muted, lineHeight: 30, marginRight: 10 }, searchInput: { flex: 1, color: palette.ink, fontSize: 15, paddingVertical: 13 }, clear: { color: palette.muted, fontSize: 26, paddingHorizontal: 4 },
  routeList: { gap: 10, marginTop: 12 }, routeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: palette.line, borderRadius: 16, minHeight: 78, paddingHorizontal: 13, paddingVertical: 12 }, pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] }, routeBadge: { minWidth: 48, height: 46, borderRadius: 12, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' }, routeNumber: { fontSize: 16, fontWeight: '800' }, routeInfo: { flex: 1, marginLeft: 14, gap: 4 }, routeName: { color: palette.ink, fontSize: 15, fontWeight: '700' }, routeHint: { color: palette.muted, fontSize: 12 }, chevron: { color: palette.muted, fontSize: 28, marginLeft: 8, marginRight: 3, marginTop: -3 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 28 }, loadingText: { color: palette.secondary, fontSize: 14 }, empty: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginTop: 12 }, emptyTitle: { color: palette.ink, fontSize: 16, fontWeight: '700' }, emptyText: { color: palette.secondary, marginTop: 6, lineHeight: 20 }, footer: { textAlign: 'center', color: palette.muted, fontSize: 11, marginTop: 28 },
});
