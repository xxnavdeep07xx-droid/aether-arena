'use client';

import { useCallback, useSyncExternalStore } from 'react';

// ==================== i18n SYSTEM ====================

export type Language = 'en' | 'hi';

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.tournaments': 'Tournaments',
    'nav.leaderboard': 'Leaderboard',
    'nav.streams': 'Streams',
    'nav.aether': 'Aether',
    'nav.profile': 'Profile',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',
    'nav.contact': 'Contact Us',
    'nav.admin': 'Admin Panel',
    'nav.privacyPolicy': 'Privacy Policy',
    'nav.termsConditions': 'Terms & Conditions',
    'nav.refundPolicy': 'Refund Policy',

    // Mobile nav
    'mobile.home': 'Home',
    'mobile.tourneys': 'Tourneys',
    'mobile.ranks': 'Ranks',
    'mobile.streams': 'Streams',
    'mobile.profile': 'Profile',

    // Section titles
    'section.adminPanel': 'Admin Panel',
    'section.contactUs': 'Contact Us',

    // Home view
    'home.noStreams': 'No streams right now',
    'home.noStreamsDesc': 'Tune in later for live tournament broadcasts, gameplay streams, and community events.',
    'home.liveNow': 'LIVE NOW',
    'home.upcoming': 'UPCOMING',
    'home.watchNow': 'Watch Now',
    'home.viewTournament': 'View Tournament',
    'home.topPlayers': 'Top Players',
    'home.viewAll': 'View All',
    'home.noRankedPlayers': 'No ranked players yet',
    'home.beTheFirst': 'Be the first to compete and claim the top spot!',
    'home.recommendedGear': 'Recommended Gear',
    'home.noGearYet': 'No gear recommendations yet',
    'home.noGearDesc': 'We are partnering with top gaming brands. Stay tuned for exclusive deals!',
    'home.quickTopUp': 'Quick Top Up',
    'home.codashop': 'Codashop',
    'home.topupPacksComing': 'Top-up packs coming soon',
    'home.topupPacksComingDesc': 'Get game currency at the best prices. Stay tuned!',
    'home.tournaments': 'Tournaments',
    'home.browseAll': 'Browse All',
    'home.noTournaments': 'No tournaments yet',
    'home.noTournamentsDesc': 'The arena is being prepared! Check back soon for exciting battles and epic prize pools.',
    'home.featured': '🔥 Featured',
    'home.open': 'Open',
    'home.live': '🔴 Live',
    'home.registerNow': 'Register Now',
    'home.registered': 'Registered',

    // Tournaments view
    'tournaments.title': 'Tournaments',
    'tournaments.all': 'All',
    'tournaments.filter': 'Filters',

    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Customize your experience',
    'settings.profileSettings': 'Profile Settings',
    'settings.profileDesc': 'Update your display name and bio',
    'settings.connectedAccounts': 'Connected Accounts',
    'settings.connectedDesc': 'Manage your linked accounts and credentials',
    'settings.appearance': 'Appearance',
    'settings.appearanceDesc': 'Choose your preferred theme',
    'settings.dark': 'Dark',
    'settings.light': 'Light',
    'settings.system': 'System',
    'settings.darkDesc': 'Easier on the eyes at night',
    'settings.lightDesc': 'Clean and bright interface',
    'settings.systemDesc': 'Follow your device settings',
    'settings.language': 'Language',
    'settings.languageDesc': 'Set your preferred language',
    'settings.notifications': 'Notifications',
    'settings.notificationsDesc': 'Control how you receive notifications',
    'settings.privacy': 'Privacy & Data',
    'settings.privacyDesc': 'Control your privacy and manage stored data',
    'settings.account': 'Account',
    'settings.accountDesc': 'Manage your account settings',
    'settings.edit': 'Edit',
    'settings.saveChanges': 'Save Changes',
    'settings.cancel': 'Cancel',
    'settings.displayName': 'Display Name',
    'settings.bio': 'Bio',
    'settings.logout': 'Log Out',
    'settings.deleteAccount': 'Delete Account',
    'settings.pushNotifications': 'Push Notifications',
    'settings.browserPushAlerts': 'Browser push alerts',
    'settings.tournamentAlerts': 'Tournament Alerts',
    'settings.tournamentAlertsDesc': 'Get notified when tournaments open for registration or are about to start',
    'settings.resultUpdates': 'Result Updates',
    'settings.resultUpdatesDesc': 'Receive updates when tournament results are published',
    'settings.promoOffers': 'Promotions & Offers',
    'settings.promoOffersDesc': 'Special deals on top-ups, gaming gear, and events',
    'settings.communityUpdates': 'Community Updates',
    'settings.communityUpdatesDesc': 'News, announcements, and platform updates',
    'settings.profileVisibility': 'Profile Visibility',
    'settings.profilePublic': 'Anyone can see your profile and stats',
    'settings.profilePrivate': 'Only you can see your profile',
    'settings.public': 'Public',
    'settings.private': 'Private',
    'settings.showLeaderboard': 'Show on Leaderboard',
    'settings.showLeaderboardDesc': 'Display your ranking on public leaderboards',
    'settings.showActivity': 'Show Activity Status',
    'settings.showActivityDesc': 'Let others see when you are online',
    'settings.clearCache': 'Clear Local Cache',
    'settings.clearCacheDesc': 'Clear temporary data and cached images. Your settings will be preserved.',
    'settings.clear': 'Clear',

    // Tournament statuses
    'status.upcoming': 'Upcoming',
    'status.registration_open': 'Registration Open',
    'status.in_progress': 'In Progress',
    'status.completed': 'Completed',
    'status.cancelled': 'Cancelled',

    // Common
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.free': 'Free',
    'common.comingSoon': 'Coming soon',
  },
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.tournaments': 'टूर्नामेंट',
    'nav.leaderboard': 'लीडरबोर्ड',
    'nav.streams': 'स्ट्रीम्स',
    'nav.aether': 'एथर',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.notifications': 'सूचनाएँ',
    'nav.settings': 'सेटिंग्स',
    'nav.contact': 'संपर्क करें',
    'nav.admin': 'एडमिन पैनल',
    'nav.privacyPolicy': 'गोपनीयता नीति',
    'nav.termsConditions': 'नियम और शर्तें',
    'nav.refundPolicy': 'रिफंड नीति',

    // Mobile nav
    'mobile.home': 'होम',
    'mobile.tourneys': 'टूर्नामेंट',
    'mobile.ranks': 'रैंक',
    'mobile.streams': 'स्ट्रीम्स',
    'mobile.profile': 'प्रोफ़ाइल',

    // Section titles
    'section.adminPanel': 'एडमिन पैनल',
    'section.contactUs': 'संपर्क करें',

    // Home view
    'home.noStreams': 'अभी कोई स्ट्रीम नहीं',
    'home.noStreamsDesc': 'लाइव टूर्नामेंट प्रसारण, गेमप्ले स्ट्रीम और कम्युनिटी इवेंट्स के लिए बाद में ट्यून करें।',
    'home.liveNow': 'अभी लाइव',
    'home.upcoming': 'आगामी',
    'home.watchNow': 'अभी देखें',
    'home.viewTournament': 'टूर्नामेंट देखें',
    'home.topPlayers': 'टॉप खिलाड़ी',
    'home.viewAll': 'सभी देखें',
    'home.noRankedPlayers': 'अभी तक कोई रैंक वाला खिलाड़ी नहीं',
    'home.beTheFirst': 'प्रतिस्पर्धा करने और शीर्ष स्थान हासिल करने वाले पहले बनें!',
    'home.recommendedGear': 'अनुशंसित गियर',
    'home.noGearYet': 'अभी कोई गियर सुझाव नहीं',
    'home.noGearDesc': 'हम शीर्ष गेमिंग ब्रांड्स के साथ साझेदारी कर रहे हैं। एक्सक्लूसिव डील के लिए बने रहें!',
    'home.quickTopUp': 'क्विक टॉप अप',
    'home.codashop': 'कोडाशॉप',
    'home.topupPacksComing': 'टॉप-अप पैक जल्द आ रहे हैं',
    'home.topupPacksComingDesc': 'सबसे अच्छी कीमतों पर गेम करेंसी पाएं। बने रहें!',
    'home.tournaments': 'टूर्नामेंट',
    'home.browseAll': 'सभी ब्राउज़ करें',
    'home.noTournaments': 'अभी कोई टूर्नामेंट नहीं',
    'home.noTournamentsDesc': 'एरेना तैयार हो रहा है! रोमांचक लड़ाइयों और महान पुरस्कार पूल के लिए जल्द ही वापस आएं।',
    'home.featured': '🔥 फीचर्ड',
    'home.open': 'खुला',
    'home.live': '🔴 लाइव',
    'home.registerNow': 'अभी रजिस्टर करें',
    'home.registered': 'रजिस्टर्ड',

    // Tournaments view
    'tournaments.title': 'टूर्नामेंट',
    'tournaments.all': 'सभी',
    'tournaments.filter': 'फ़िल्टर',

    // Settings
    'settings.title': 'सेटिंग्स',
    'settings.subtitle': 'अपने अनुभव को अनुकूलित करें',
    'settings.profileSettings': 'प्रोफ़ाइल सेटिंग्स',
    'settings.profileDesc': 'अपना डिस्प्ले नाम और बायो अपडेट करें',
    'settings.connectedAccounts': 'कनेक्टेड अकाउंट्स',
    'settings.connectedDesc': 'अपने लिंक्ड अकाउंट्स और क्रेडेंशियल्स मैनेज करें',
    'settings.appearance': 'दिखावट',
    'settings.appearanceDesc': 'अपना पसंदीदा थीम चुनें',
    'settings.dark': 'डार्क',
    'settings.light': 'लाइट',
    'settings.system': 'सिस्टम',
    'settings.darkDesc': 'रात में आंखों के लिए आसान',
    'settings.lightDesc': 'क्लीन और ब्राइट इंटरफ़ेस',
    'settings.systemDesc': 'अपने डिवाइस सेटिंग्स का पालन करें',
    'settings.language': 'भाषा',
    'settings.languageDesc': 'अपनी पसंदीदा भाषा सेट करें',
    'settings.notifications': 'सूचनाएँ',
    'settings.notificationsDesc': 'सूचनाएं कैसे प्राप्त करें, नियंत्रित करें',
    'settings.privacy': 'गोपनीयता और डेटा',
    'settings.privacyDesc': 'अपनी गोपनीयता नियंत्रित करें और संग्रहीत डेटा प्रबंधित करें',
    'settings.account': 'अकाउंट',
    'settings.accountDesc': 'अपनी अकाउंट सेटिंग्स प्रबंधित करें',
    'settings.edit': 'संपादित करें',
    'settings.saveChanges': 'परिवर्तन सहेजें',
    'settings.cancel': 'रद्द करें',
    'settings.displayName': 'डिस्प्ले नाम',
    'settings.bio': 'बायो',
    'settings.logout': 'लॉग आउट',
    'settings.deleteAccount': 'अकाउंट हटाएं',
    'settings.pushNotifications': 'पुश सूचनाएँ',
    'settings.browserPushAlerts': 'ब्राउज़र पुश अलर्ट',
    'settings.tournamentAlerts': 'टूर्नामेंट अलर्ट',
    'settings.tournamentAlertsDesc': 'जब टूर्नामेंट रजिस्ट्रेशन के लिए खुलें या शुरू होने वाले हों तो सूचित किया जाए',
    'settings.resultUpdates': 'परिणाम अपडेट',
    'settings.resultUpdatesDesc': 'टूर्नामेंट परिणाम प्रकाशित होने पर अपडेट प्राप्त करें',
    'settings.promoOffers': 'प्रमोशन और ऑफ़र',
    'settings.promoOffersDesc': 'टॉप-अप, गेमिंग गियर और इवेंट्स पर विशेष डील',
    'settings.communityUpdates': 'कम्युनिटी अपडेट',
    'settings.communityUpdatesDesc': 'समाचार, घोषणाएं और प्लेटफ़ॉर्म अपडेट',
    'settings.profileVisibility': 'प्रोफ़ाइल दृश्यता',
    'settings.profilePublic': 'कोई भी आपकी प्रोफ़ाइल और स्टैट्स देख सकता है',
    'settings.profilePrivate': 'केवल आप अपनी प्रोफ़ाइल देख सकते हैं',
    'settings.public': 'सार्वजनिक',
    'settings.private': 'निजी',
    'settings.showLeaderboard': 'लीडरबोर्ड पर दिखाएं',
    'settings.showLeaderboardDesc': 'सार्वजनिक लीडरबोर्ड पर अपनी रैंकिंग प्रदर्शित करें',
    'settings.showActivity': 'गतिविधि स्थिति दिखाएं',
    'settings.showActivityDesc': 'दूसरों को देखने दें कि आप ऑनलाइन हैं',
    'settings.clearCache': 'स्थानीय कैश साफ़ करें',
    'settings.clearCacheDesc': 'अस्थायी डेटा और कैश की गई छवियां साफ़ करें। आपकी सेटिंग्स संरक्षित रहेंगी।',
    'settings.clear': 'साफ़ करें',

    // Tournament statuses
    'status.upcoming': 'आगामी',
    'status.registration_open': 'रजिस्ट्रेशन खुला',
    'status.in_progress': 'जारी',
    'status.completed': 'पूर्ण',
    'status.cancelled': 'रद्द',

    // Common
    'common.search': 'खोजें',
    'common.loading': 'लोड हो रहा है...',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.close': 'बंद करें',
    'common.confirm': 'पुष्टि करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.create': 'बनाएं',
    'common.update': 'अपडेट करें',
    'common.free': 'मुफ़्त',
    'common.comingSoon': 'जल्द आ रहा है',
  },
};

// Reactive theme hook — re-renders when theme changes
let themeListeners: Array<() => void> = [];

function subscribeToTheme(callback: () => void) {
  themeListeners.push(callback);
  return () => { themeListeners = themeListeners.filter(l => l !== callback); };
}

function getThemeSnapshot(): string {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('aa-theme') as string | null;
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  return 'dark';
}

function getServerThemeSnapshot(): string {
  return 'dark';
}

export function useTheme(): string {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);
  return theme;
}

// Call this after setting the theme to trigger re-renders
export function notifyThemeChange() {
  for (const listener of themeListeners) listener();
}

// Reactive language hook
let languageListeners: Array<() => void> = [];

function subscribeToLanguage(callback: () => void) {
  languageListeners.push(callback);
  return () => { languageListeners = languageListeners.filter(l => l !== callback); };
}

function getLanguageSnapshot(): Language {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('aa-language') as Language | null;
  if (saved && (saved === 'en' || saved === 'hi')) return saved;
  return 'en';
}

function getServerLanguageSnapshot(): Language {
  return 'en';
}

export function useLanguage(): Language {
  return useSyncExternalStore(subscribeToLanguage, getLanguageSnapshot, getServerLanguageSnapshot);
}

// Call this after setting the language to trigger re-renders
export function notifyLanguageChange() {
  for (const listener of languageListeners) listener();
}

// Translation hook
export function useTranslation() {
  const lang = useLanguage();
  const t = useCallback((key: string, fallback?: string): string => {
    return translations[lang]?.[key] || translations.en[key] || fallback || key;
  }, [lang]);
  return { t, lang };
}

// Export translations for direct use
export { translations };
