import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'completadapp:precios'

export const DEFAULT_PRICES: Record<string, number> = {
  vienesas: 1750,
  pan:       1990,
  palta:     5500,
  tomate:    1990,
  mayonesa:  6590,
  mostaza:   2090,
  ketchup:   2995,
  chucrut:    990,
}

export async function initializePrices(): Promise<void> {
  const existing = await AsyncStorage.getItem(STORAGE_KEY)
  if (!existing) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRICES))
  }
}

export async function loadPrices(): Promise<Record<string, number>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  if (!raw) return { ...DEFAULT_PRICES }
  try {
    return { ...DEFAULT_PRICES, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_PRICES }
  }
}

export async function savePrices(prices: Record<string, number>): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prices))
}
