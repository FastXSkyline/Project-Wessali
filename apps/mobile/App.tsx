import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { LocaleProvider } from './src/ui/base';
import { BottomDock, type Tab } from './src/ui/BottomDock';
import { FeedbackToast } from './src/ui/feedback';
import { SignInScreen } from './src/screens/SignInScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { BookingScreen } from './src/screens/BookingScreen';
import { RequestsScreen } from './src/screens/RequestsScreen';
import { PartnerScreen } from './src/screens/PartnerScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

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
    return <View style={styles.splash} />;
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

  useEffect(() => {
    if (!app.session) {
      setTab('home');
      setBookingOpen(false);
    }
  }, [app.session]);

  function navigate(next: Tab) {
    app.setError('');
    if (next === 'create') {
      app.beginBooking('freight');
      setBookingOpen(true);
      return;
    }
    setTab(next);
    if (app.session && (next === 'requests' || next === 'partner' || next === 'home')) {
      void app.refreshData();
    }
  }

  function openService(kind: Parameters<typeof app.beginBooking>[0]) {
    app.setError('');
    app.beginBooking(kind);
    setBookingOpen(true);
  }

  function continueAsProvider() {
    app.setRole('provider');
    void app.signOut();
    setTab('home');
  }

  const content = (() => {
    if (!app.session) return <SignInScreen app={app} />;
    if (bookingOpen) {
      return (
        <BookingScreen
          app={app}
          onBack={() => setBookingOpen(false)}
          onSent={() => {
            setBookingOpen(false);
            setTab('requests');
          }}
        />
      );
    }
    if (tab === 'requests') {
      return (
        <RequestsScreen
          app={app}
          onStartRequest={() => openService('freight')}
          onOpenPartner={() => navigate('partner')}
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
      />
    );
  })();

  const message = app.error || app.notice;

  return (
    <LocaleProvider locale={app.locale}>
      <View style={styles.root}>
        <StatusBar style="light" />
        {content}
        {app.session && !bookingOpen ? (
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
  splash: { flex: 1, backgroundColor: palette.canvas },
});
