import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from '@expo-google-fonts/sora';
import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-arabic';
import { palette } from './src/theme';
import { useWessali } from './src/useWessali';
import { BrandMark, LocaleProvider } from './src/ui/base';
import { BottomDock, type Tab } from './src/ui/BottomDock';
import { FeedbackToast } from './src/ui/feedback';
import { SignInScreen } from './src/screens/SignInScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { BookingScreen } from './src/screens/BookingScreen';
import { RequestsScreen } from './src/screens/RequestsScreen';
import { PartnerScreen } from './src/screens/PartnerScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { TrackingScreen } from './src/screens/TrackingScreen';
import type { Booking } from './src/types';
import { ScreenTransition, type MotionDirection } from './src/ui/motion';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <LinearGradient colors={['#061F3A', '#0A3763', '#0E4A7D']} style={styles.splash}>
        <StatusBar style="light" />
        <BrandMark size={82} />
        <Text style={styles.splashTitle}>Wessali</Text>
        <Text style={styles.splashSubtitle}>Freight · Roadside · Water</Text>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaProvider>
      <AppRoot />
    </SafeAreaProvider>
  );
}

function AppRoot() {
  const app = useWessali();
  const [tab, setTab] = useState<Tab>('home');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [trackingBooking, setTrackingBooking] = useState<Booking | null>(null);
  const [motionDirection, setMotionDirection] = useState<MotionDirection>('fade');

  useEffect(() => {
    if (!app.session) {
      setTab('home');
      setBookingOpen(false);
      setTrackingBooking(null);
      setMotionDirection('down');
    } else {
      setMotionDirection('up');
    }
  }, [app.session]);

  function navigate(next: Tab) {
    app.setError('');
    setTrackingBooking(null);
    if (next === 'create') {
      setMotionDirection('up');
      app.beginBooking('freight');
      setBookingOpen(true);
      return;
    }
    if (next !== tab) {
      const order: Tab[] = ['home', 'requests', 'partner', 'profile'];
      const fromIndex = order.indexOf(tab);
      const toIndex = order.indexOf(next);
      const movesRight = (toIndex > fromIndex) !== app.isRtl;
      setMotionDirection(movesRight ? 'forward' : 'back');
    }
    setTab(next);
    if (app.session && (next === 'requests' || next === 'partner' || next === 'home')) {
      void app.refreshData();
    }
  }

  function openService(kind: Parameters<typeof app.beginBooking>[0]) {
    app.setError('');
    setMotionDirection('up');
    app.beginBooking(kind);
    setBookingOpen(true);
  }

  function continueAsProvider() {
    app.setRole('provider');
    void app.signOut();
    setTab('home');
  }

  const content = (() => {
    if (!app.ready) {
      return (
        <LinearGradient colors={['#061F3A', '#0A3763', '#0E4A7D']} style={styles.splash}>
          <StatusBar style="light" />
          <BrandMark size={72} />
          <Text style={styles.splashTitle}>Wessali</Text>
        </LinearGradient>
      );
    }
    if (!app.session) return <SignInScreen app={app} />;
    if (bookingOpen) {
      return (
        <BookingScreen
          app={app}
          onBack={() => {
            setMotionDirection('down');
            setBookingOpen(false);
          }}
          onSent={() => {
            setMotionDirection('forward');
            setBookingOpen(false);
            setTab('requests');
          }}
        />
      );
    }
    if (trackingBooking) {
      return <TrackingScreen app={app} booking={trackingBooking} onBack={() => {
        setMotionDirection('back');
        setTrackingBooking(null);
      }} />;
    }
    if (tab === 'requests') {
      return (
        <RequestsScreen
          app={app}
          onStartRequest={() => openService('freight')}
          onOpenPartner={() => navigate('partner')}
          onOpenTracking={(booking) => {
            setMotionDirection('forward');
            setTrackingBooking(booking);
          }}
        />
      );
    }
    if (tab === 'partner') {
      return (
        <PartnerScreen
          app={app}
          onContinueAsProvider={continueAsProvider}
          onOpenQueue={() => navigate('requests')}
        />
      );
    }
    if (tab === 'profile') return <ProfileScreen app={app} />;
    return (
      <HomeScreen
        app={app}
        onStartRequest={() => openService('freight')}
        onOpenService={openService}
        onOpenRequests={() => navigate('requests')}
        onOpenPartner={() => navigate('partner')}
        onOpenProfile={() => navigate('profile')}
        onOpenTracking={() => {
          if (app.activeBooking) {
            setMotionDirection('forward');
            setTrackingBooking(app.activeBooking);
          }
        }}
      />
    );
  })();

  const screenKey = !app.ready
    ? 'loading'
    : !app.session
      ? 'signin'
      : trackingBooking
        ? `tracking:${trackingBooking.id}`
        : bookingOpen
          ? 'booking'
          : `tab:${tab}:${app.isProvider ? 'provider' : 'customer'}`;

  const message = app.error || app.notice;

  return (
    <LocaleProvider locale={app.locale}>
      <View style={styles.root}>
        <StatusBar style="dark" />
        <ScreenTransition transitionKey={screenKey} direction={motionDirection}>
          {content}
        </ScreenTransition>
        {app.session && !bookingOpen && !trackingBooking ? (
          <BottomDock
            active={tab}
            onSelect={navigate}
            labels={{
              home: app.ui.navHome,
              requests: app.ui.navRequests,
              new: app.ui.navNew,
              partner: app.isProvider ? app.ui.navPartner : app.ui.navPartnerNew,
              profile: app.ui.navProfile,
            }}
          />
        ) : null}
        {message ? (
          <FeedbackToast
            message={message}
            tone={app.error ? 'danger' : 'success'}
            onClose={() => {
              app.setError('');
              app.setNotice('');
            }}
          />
        ) : null}
      </View>
    </LocaleProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.canvas, overflow: 'hidden' },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 13 },
  splashTitle: { color: '#FFFFFF', fontSize: 31, fontWeight: '800', letterSpacing: -0.5 },
  splashSubtitle: { color: 'rgba(255,255,255,0.78)', fontSize: 11, fontWeight: '500', letterSpacing: 0.2 },
});
