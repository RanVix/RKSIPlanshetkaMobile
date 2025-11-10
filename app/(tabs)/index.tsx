import { useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BurgerMenuIcon from '../../assets/BurgerMenu.svg';
import CabinetIcon from '../../assets/Cabinet.svg';
import CombinedIcon from '../../assets/Combined.svg';
import SearchIcon from '../../assets/SearchIcon.svg';
import UserIcon from '../../assets/User.svg';
import BellIcon from '../../assets/bell.svg';
import CalendarIcon from '../../assets/calendarik.svg';

type Lesson = {
  id: string;
  startTime: string;
  endTime?: string;
  title: string;
  teacher?: string;
  room?: string;
  group?: string;
  number: number;
};

export default function HomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'bell'>('calendar');
  const slideAnim = useRef(new Animated.Value(-Dimensions.get('window').width * 0.6)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    if (menuOpen) {
      // Закрываем меню
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -Dimensions.get('window').width * 0.6,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setMenuOpen(false));
    } else {
      // Открываем меню
      setMenuOpen(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const data: Lesson[] = useMemo(
    () => [
      {
        id: '1',
        startTime: '11:30',
        endTime: '13:00',
        title: 'Основы кибернетики и робототехники',
        teacher: 'Сулавко С.Н.',
        room: '414',
        group: 'ИС-28',
        number: 3,
      },
      {
        id: '2',
        startTime: '13:10',
        endTime: '14:40',
        title: '—',
        teacher: 'Швачич Д.С.',
        room: 'с/32',
        group: '',
        number: 4,
      },
      {
        id: '3',
        startTime: '15:00',
        endTime: '16:30',
        title: 'Иностранный язык в профессиональной деятельности',
        teacher: 'Лебедева М.В',
        room: '104',
        group: '',
        number: 5,
      },
    ],
    []
  );

  return (
    <View style={styles.container}>
      {/* Оверлэй */}
      {menuOpen && (
        <Animated.View 
          style={[
            styles.overlay,
            { opacity: overlayOpacity }
          ]}
        >
          <TouchableOpacity 
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={toggleMenu}
          />
        </Animated.View>
      )}

      {/* Боковое меню */}
      <Animated.View 
        style={[
          styles.sideMenu,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        {/* Лого и титульник */}
        <View style={styles.menuHeader}>
          <Image 
            source={require('../../assets/logoburger.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>РКСИ Планшетка</Text>
        </View>

        {/* Менюка и кнопки */}
        <View style={styles.menuItems}>
          <TouchableOpacity style={styles.menuItem}>
            <Image source={require('../../assets/BellIcon.png')} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Подписки</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Image source={require('../../assets/TimeIcon.png')} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Расписание звонков</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Image source={require('../../assets/ThemeIcon.png')} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Темы</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Image source={require('../../assets/URLIcon.png')} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Файл планшетки</Text>
          </TouchableOpacity>
        </View>

        {/* Футер бокового меню */}
        <View style={styles.menuFooter}>
          <Text style={styles.footerText}>v0.1.0 by Yarovich, RanVix</Text>
        </View>
      </Animated.View>
      {/* Верхняя часть (иконка бургера и поиск) */}
      <View style={styles.topBar}>
        <View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleMenu}
            style={styles.burgerButton}
          >
            <BurgerMenuIcon width={18} height={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            placeholder="Группа: ИС-21"
            placeholderTextColor="#FFFF"
            style={styles.searchInput}
          />
          <SearchIcon width={16} height={16} />
        </View>
      </View>

      {/* Дата */}
      <View style={styles.dateRow}>
        <View style={styles.datePill}>
          <Text style={styles.dateText} numberOfLines={1}>Сегодня, 30.10 | 1 корпус</Text>
        </View>
      </View>

      {/* Список пар */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={(
          <View style={styles.footerInline}>
            <Text style={styles.footerLinkText}>планшетка</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              {/* Время и номер */}
              <View style={styles.timeCol}>
                <Text style={styles.startTime}>{item.startTime}</Text>
                {item.endTime ? (
                  <Text style={styles.endTime}>{item.endTime}</Text>
                ) : null}
                <View style={styles.lessonNumberWrap}>
                  <Text style={styles.lessonNumber}>{item.number}</Text>
                </View>
              </View>

              {/* Контент пар */}
              <View style={styles.cardContent}>
                <View style={styles.titleBar}>
                  <View style={styles.titleBarInner}>
                    <Text style={styles.titleText} numberOfLines={2}>{item.title}</Text>
                  </View>
                </View>

                <View style={styles.infoLine}>
                  <UserIcon width={16} height={16} style={styles.icon} />
                  <Text style={styles.metaText} numberOfLines={1}>{item.teacher || '—'}</Text>
                </View>

                <View style={styles.infoLine}>
                  <CabinetIcon width={16} height={16} style={styles.icon} />
                  <Text style={styles.metaText}>{item.room || '—'}</Text>
                </View>

                {Boolean(item.group) && (
                  <View style={styles.infoLine}>
                    <CombinedIcon width={16} height={16} style={styles.icon} />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {item.group}
                      {item.room ? ` · ${item.room}` : ''}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      />

      {/* Снизу смена окон */}
      <View style={styles.bottomTabs}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('calendar')}
            style={[
              styles.toggleButton,
              activeTab === 'calendar' && styles.toggleButtonActive,
            ]}
          >
            <CalendarIcon width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('bell')}
            style={[
              styles.toggleButton,
              activeTab === 'bell' && styles.toggleButtonActive,
            ]}
          >
            <BellIcon width={20} height={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1318',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  burgerButton: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: '#1B2129',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  burgerIcon: { color: '#D1D5DB' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  overlayTouchable: {
    flex: 1,
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: Dimensions.get('window').width * 0.6,
    backgroundColor: '#191C21',
    zIndex: 999,
    paddingTop: 60,
    paddingHorizontal: 12,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  appTitle: {
    color: '#F3F4F6',
    fontSize: 20,
    fontWeight: '600',
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  menuItemText: {
    color: '#F3F4F6',
    fontSize: 16,
  },
  menuFooter: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  searchBox: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1B2129',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: { flex: 1, color: '#F3F4F6' },
  searchIcon: { color: '#9CA3AF' },
  dateRow: { paddingHorizontal: 16, alignItems: 'center' },
  datePill: {
    height: 32,
    borderRadius: 999,
    backgroundColor: '#3D4A5D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  dateText: { color: '#E5E7EB', fontSize: 13, flexShrink: 1, marginRight: 6 },
  listContent: { padding: 16 },
  footerLinkContainer: { alignItems: 'center', paddingVertical: 16 },
  footerInline: { alignItems: 'center', paddingTop: 8, paddingBottom: 4 },
  footerStatic: { alignItems: 'center', paddingVertical: 24 },
  footerLinkText: { color: '#BFBFBF', fontSize: 12, fontWeight: '400' },
  card: {
    borderRadius: 16,
    backgroundColor: '#171C22',
    padding: 12,
    marginBottom: 12,
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timeCol: { width: 64, alignItems: 'flex-start' },
  startTime: { color: '#F3F4F6', fontSize: 20, fontWeight: '600' },
  endTime: { color: '#9CA3AF', fontSize: 13, marginTop: 4 },
  lessonNumberWrap: {
    marginTop: 12,
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumber: { color: '#1B2129', fontSize: 16, fontWeight: 800 },
  cardContent: { flex: 1 },
  titleBar: { marginBottom: 8 },
  titleBarInner: {
    borderRadius: 12,
    backgroundColor: '#1B2129',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: { color: '#F3F4F6', fontSize: 13, fontWeight: '500', flex: 1 },
  badge: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#273244',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: { color: '#E5E7EB', fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaRowAlt: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  metaIcon: { color: '#9CA3AF' },
  metaText: { color: '#E5E7EB', fontSize: 13, maxWidth: '90%' },
  infoLine: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  icon: { marginRight: 8 },
  bottomTabs: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: '#0F1318',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1B2129',
    borderRadius: 24,
    padding: 4,
    width: 100,
    justifyContent: 'space-between',
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#3D4A5D',
  },
});