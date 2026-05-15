import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Completada } from '@/types'

const STORAGE_KEY = 'completadapp:completadas'

async function readAll(): Promise<Completada[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  return JSON.parse(raw) as Completada[]
}

export async function guardarCompletada(completada: Completada): Promise<void> {
  const list = await readAll()
  const idx = list.findIndex((c) => c.id === completada.id)
  if (idx >= 0) {
    list[idx] = completada
  } else {
    list.push(completada)
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export async function listarCompletadas(): Promise<Completada[]> {
  return readAll()
}

export async function obtenerCompletada(id: string): Promise<Completada | null> {
  const list = await readAll()
  return list.find((c) => c.id === id) ?? null
}

export async function eliminarCompletada(id: string): Promise<void> {
  const list = await readAll()
  const filtered = list.filter((c) => c.id !== id)
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}
