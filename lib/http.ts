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

import axios from 'axios'
import Constants from 'expo-constants'

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ??
  Constants.manifest2?.extra?.expoClient?.extra?.apiBaseUrl ??
  'https://ranvix-portfolio.ru/api/v1'

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { Accept: 'application/json' },
  validateStatus: () => true,
})
