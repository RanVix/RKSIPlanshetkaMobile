// Planshetka - A convenient schedule viewing app
// Copyright (C) 2025  RanVix & Yarovich

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    
    // Настройка системной панели для Android
    if (Platform.OS === 'android') {
      // Делаем панель прозрачной, чтобы она подхватила цвет фона View
      NavigationBar.setPositionAsync('absolute');
      NavigationBar.setBackgroundColorAsync('#00000000'); // Полная прозрачность
      // Делаем иконки (назад/домой) светлыми
      NavigationBar.setButtonStyleAsync('light');
    }
  }, []);

  return (
    <SafeAreaProvider>
      {/* Главный контейнер с твоим цветом фона */}
      <View style={{ flex: 1, backgroundColor: '#0F1115' }}>
        <StatusBar style="light" backgroundColor="#0F1115" translucent />
        
        <Stack
          screenOptions={{
            headerShown: false,
            // flex: 1 здесь гарантирует, что контент растянется на всю высоту
            contentStyle: { backgroundColor: '#0F1115', flex: 1 },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}