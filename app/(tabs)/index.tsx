import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Image, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BurgerMenuIcon from '../../assets/BurgerMenu.svg';
import CabinetIcon from '../../assets/Cabinet.svg';
import CombinedIcon from '../../assets/Combined.svg';
import SearchIcon from '../../assets/SearchIcon.svg';
import ThemeIcon from '../../assets/ThemeIcon.svg';
import UserIcon from '../../assets/User.svg';
import BellIcon from '../../assets/WhiteBell.svg';
import CalendarIcon from '../../assets/calendarik.svg';
import TrashIcon from '../../assets/trash.svg';

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
  const [currentPage, setCurrentPage] = useState<'home' | 'subscriptions' | 'bells' | 'themes'>('home');
  const [subscriptions, setSubscriptions] = useState<{ id: string; title: string }[]>([]);
  const [bellsListReady, setBellsListReady] = useState(false);
  const slideAnim = useRef(new Animated.Value(-Dimensions.get('window').width * 0.6)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const bellsFlatListRef = useRef<FlatList>(null);
  const hasScrolledToInitial = useRef(false);

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

  // Сбрасываем состояние при смене страницы
  useEffect(() => {
    if (currentPage === 'bells') {
      setBellsListReady(false);
      hasScrolledToInitial.current = false;
    }
  }, [currentPage]);

  // Центрируем камеру на "Обычное расписание" после того, как список готов
  useEffect(() => {
    if (currentPage === 'bells' && bellsListReady && !hasScrolledToInitial.current && bellsFlatListRef.current) {
      // Используем двойной requestAnimationFrame для гарантии, что FlatList полностью отрендерен
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (bellsFlatListRef.current) {
            const screen = Dimensions.get('window').width;
            const cardWidth = screen * 0.52;
            const itemSize = cardWidth + 12; // карточка + отступ
            const index = 1; // "Обычное расписание"
            const padding = 16; // paddingHorizontal из styles.bellsList
            
            // Вычисляем offset для центрирования элемента
            // Позиция начала элемента: padding + itemSize * index
            // Для центрирования: offset = позиция_начала - (ширина_экрана - ширина_карточки) / 2
            const elementStart = padding + itemSize * index;
            const offset = elementStart - (screen - cardWidth) / 2;
            
            bellsFlatListRef.current.scrollToOffset({
              offset: Math.max(0, offset),
              animated: false,
            });
            hasScrolledToInitial.current = true;
          }
        });
      });
    }
  }, [currentPage, bellsListReady]);

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
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.menuHeader}
          onPress={() => {
            setCurrentPage('home');
            setActiveTab('calendar');
            toggleMenu();
          }}
        >
          <Image 
            source={require('../../assets/logoburger.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>РКСИ Планшетка</Text>
        </TouchableOpacity>

        {/* Менюка и кнопки */}
        <View style={styles.menuItems}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setCurrentPage('subscriptions');
              toggleMenu();
            }}
          >
            <Image source={require('../../assets/BellIcon.png')} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Подписки</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Image source={require('../../assets/TimeIcon.png')} style={styles.menuIcon} />
            <Text
              style={styles.menuItemText}
              onPress={() => {
                setCurrentPage('bells');
                toggleMenu();
              }}
            >
              Расписание звонков
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setCurrentPage('themes');
              toggleMenu();
            }}
          >
            <Image source={require('../../assets/ThemeIcon.png')} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Темы</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={async () => {
              const url = 'https://drive.google.com/drive/folders/1kUYiSAafghhYR0ARyXwPW1HZPpHcFIag?usp=sharing';
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                await Linking.openURL(url);
              }
              toggleMenu();
            }}
          >
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

      {currentPage === 'home' ? (
        activeTab === 'calendar' ? (
          <>
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
          </>
        ) : (
          <View style={styles.notificationsContainer}>
            <Text style={styles.notificationsTitle}>Уведомления</Text>
            <View style={styles.notificationsEmpty}>
              <BellIcon width={24} height={24} style={styles.icon} />
              <Text style={styles.notificationsEmptyText}>Пока нет уведомлений</Text>
            </View>
          </View>
        )
      ) : (
        currentPage === 'subscriptions' ? (
        <View style={styles.subscriptionsContainer}>
          <Text style={styles.subscriptionsTitle}>Подписки</Text>
          <FlatList
            data={subscriptions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.subscriptionsList}
            ListEmptyComponent={(
              <View style={styles.notificationsEmpty}>
                <Text style={styles.notificationsEmptyText}>Подписок пока нет</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styles.subscriptionCard}>
                <Text style={styles.subscriptionTitle}>{item.title}</Text>
                <TouchableOpacity
                  style={styles.subscriptionDelete}
                  onPress={() => setSubscriptions((prev) => prev.filter((s) => s.id !== item.id))}
                >
                  <TrashIcon width={18} height={18} />
                </TouchableOpacity>
              </View>
            )}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.fabAdd,
              subscriptions.length >= 10 && styles.fabAddDisabled,
            ]}
            onPress={() => {
              if (subscriptions.length >= 10) return;
              const samples = ['ИС-21', 'Сулавко С.Н.'];
              const next = samples[subscriptions.length % samples.length];
              setSubscriptions((prev) => [
                ...prev,
                { id: `${Date.now()}`, title: next },
              ]);
            }}
            disabled={subscriptions.length >= 10}
          >
            <Text style={styles.fabAddText}>+</Text>
          </TouchableOpacity>

          <View style={styles.subscriptionsFooter}>
            <Text style={styles.subscriptionsCounter}>{subscriptions.length}/10</Text>
          </View>
        </View>
        ) : currentPage === 'bells' ? (
          <View style={styles.bellsContainer}>
            <Text style={styles.bellsTitle}>Расписание звонков</Text>
            <FlatList
              ref={bellsFlatListRef}
              data={[
                {
                  id: 'short',
                  title: 'Сокращённые пары',
                  times: ['8:00 - 8:50','9:00 - 9:50','10:00 - 10:50','11:00 - 11:50','12:00 - 12:50','13:00 - 13:50','14:00 - 14:50'],
                },
                {
                  id: 'usual',
                  title: 'Обычное расписание',
                  times: ['8:00 - 9:30','9:40 - 11:10','11:30 - 13:00','13:10 - 14:40','15:00 - 16:30','16:40 - 18:10','18:20 - 19:50'],
                },
                {
                  id: 'withClass',
                  title: 'С классным часом',
                  times: ['8:00 - 9:30','9:40 - 11:10','11:30 - 13:00','13:05 - 14:05','14:10 - 15:40','16:00 - 17:30','17:40 - 19:10'],
                },
              ]}
              keyExtractor={(i) => i.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToAlignment="center"
              decelerationRate="fast"
              contentContainerStyle={styles.bellsList}
              renderItem={({ item, index }) => {
                const screen = Dimensions.get('window').width;
                const cardWidth = screen * 0.52;
                return (
                  <View style={[styles.bellCard, { width: cardWidth }]}>
                    <Text style={styles.bellCardTitle}>{item.title}</Text>
                    {item.times.map((t, idx) => (
                      <View key={idx} style={styles.bellRow}>
                        <View style={styles.bellNum}><Text style={styles.bellNumText}>{idx + 1}</Text></View>
                        <Text style={styles.bellTime}>{t}</Text>
                      </View>
                    ))}
                  </View>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              snapToInterval={Dimensions.get('window').width * 0.52 + 12}
              getItemLayout={(_, i) => {
                const size = Dimensions.get('window').width * 0.52 + 12;
                return { length: size, offset: size * i, index: i };
              }}
              onScrollToIndexFailed={(info) => {
                // Обработка ошибки, если индекс не найден
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  bellsFlatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
              }}
              onLayout={() => {
                if (currentPage === 'bells' && !bellsListReady) {
                  setBellsListReady(true);
                }
              }}
            />
          </View>
        ) : (
          <View style={styles.themesContainer}>
            <Text style={styles.themesTitle}>Темы</Text>
            <View style={styles.themesEmpty}>
              <ThemeIcon width={48} height={48} style={styles.themesIcon} />
              <Text style={styles.themesEmptyText}>Пока в разработке...</Text>
            </View>
          </View>
        )
      )}

      {currentPage === 'home' && (
        /* Снизу смена окон */
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
              <CalendarIcon
                width={20}
                height={20}
                style={activeTab === 'calendar' ? undefined : styles.inactiveIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveTab('bell')}
              style={[
                styles.toggleButton,
                activeTab === 'bell' && styles.toggleButtonActive,
              ]}
            >
              <BellIcon
                width={20}
                height={20}
                style={activeTab === 'bell' ? undefined : styles.inactiveIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    backgroundColor: '#191C21',
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
  inactiveIcon: {
    opacity: 0.4,
  },
  notificationsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  notificationsTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  notificationsEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationsEmptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
  },
  subscriptionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  subscriptionsTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  subscriptionsList: {
    paddingBottom: 120,
    alignItems: 'center',
  },
  subscriptionCard: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#171C22',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscriptionTitle: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: '500',
  },
  subscriptionDelete: {
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: '#1B2129',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabAdd: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: '#3D4A5D',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fabAddDisabled: {
    backgroundColor: '#2A3443',
    opacity: 0.6,
  },
  fabAddText: {
    color: '#F3F4F6',
    fontSize: 28,
    marginTop: -2,
  },
  subscriptionsFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionsCounter: {
    color: '#BFBFBF',
    fontSize: 14,
  },
  bellsContainer: {
    flex: 1,
    paddingTop: 8,
  },
  bellsTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  bellsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  bellCard: {
    backgroundColor: '#171C22',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 200,
    maxHeight: 400,
  },
  bellCardTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18,
  },
  bellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bellNum: {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bellNumText: {
    color: '#1B2129',
    fontSize: 20,
    fontWeight: '800',
  },
  bellTime: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '600',
  },
  themesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  themesTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  themesEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themesIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  themesEmptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
  },
});
