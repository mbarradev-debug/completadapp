import { Alert, Linking } from 'react-native'
import type { Completada, IngredientesCalculados } from '@/types'

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function formatFecha(iso: string): string {
  const d = new Date(iso)
  return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`
}

function formatCLP(n: number): string {
  return '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function calcularCostoTotal(ingredientes: IngredientesCalculados, precios: Record<string, number>): number {
  const { vienesas, pan, palta, tomate, mayonesa, mostaza, ketchup, chucrut } = ingredientes
  let t = vienesas.packsX5 * (precios.vienesas ?? 0)
  t += pan.packsX8 * (precios.pan ?? 0)
  if (palta.aplica) t += palta.mallas * (precios.palta ?? 0)
  if (tomate.aplica) t += Math.ceil(tomate.unidades * 140 / 1000) * (precios.tomate ?? 0)
  t += mayonesa.cantidad * (precios.mayonesa ?? 0)
  if (mostaza.aplica) t += mostaza.frascos * (precios.mostaza ?? 0)
  if (ketchup.aplica) t += ketchup.frascos * (precios.ketchup ?? 0)
  if (chucrut.aplica) t += chucrut.tarros * (precios.chucrut ?? 0)
  return t
}

function buildLineas(ingredientes: IngredientesCalculados): string[] {
  const { vienesas, pan, palta, tomate, mayonesa, mostaza, ketchup, chucrut } = ingredientes
  const ls: string[] = []
  ls.push(`· Vienesas — ${vienesas.packsX5} pack${vienesas.packsX5 !== 1 ? 's' : ''} x5`)
  ls.push(`· Pan de completo — ${pan.packsX8} pack${pan.packsX8 !== 1 ? 's' : ''} x8`)
  if (palta.aplica) ls.push(`· Palta Hass — ${palta.mallas} malla${palta.mallas !== 1 ? 's' : ''} 1 kg`)
  if (tomate.aplica) ls.push(`· Tomate — ${tomate.unidades} unidad${tomate.unidades !== 1 ? 'es' : ''}`)
  ls.push(`· Mayonesa Kraft — ${mayonesa.cantidad} frasco ${mayonesa.formato}`)
  if (mostaza.aplica) ls.push(`· Mostaza — ${mostaza.frascos} frasco${mostaza.frascos !== 1 ? 's' : ''}`)
  if (ketchup.aplica) ls.push(`· Ketchup — ${ketchup.frascos} frasco${ketchup.frascos !== 1 ? 's' : ''}`)
  if (chucrut.aplica) ls.push(`· Chucrut — ${chucrut.tarros} tarro${chucrut.tarros !== 1 ? 's' : ''}`)
  return ls
}

export function generarMensajeWhatsApp(completada: Completada, modo: 'individual' | 'colaborativo'): string {
  const { fecha, personas, completos, ingredientes, precios } = completada
  const nombre = completada.nombre.trim()
  const tipo = completos.italiano > 0 ? 'Italiano' : completos.dinamico > 0 ? 'Dinámico' : 'Americano'
  const costoTotal = calcularCostoTotal(ingredientes, precios)
  const costoPorPersona = Math.ceil(costoTotal / personas)
  const lista = buildLineas(ingredientes).join('\n')
  const lineaCosto = modo === 'colaborativo'
    ? `💰 *Total: ${formatCLP(costoTotal)}*  ·  ${formatCLP(costoPorPersona)} por persona`
    : `💰 *Total: ${formatCLP(costoTotal)}*`
  return [
    `🌭 *${nombre}*`,
    `📅 ${formatFecha(fecha)}  |  👥 ${personas} personas  |  ${tipo}`,
    '',
    '🛒 *Lista de compras*',
    lista,
    '',
    lineaCosto,
    '',
    '¿Tú organizas el próximo? → completadapp.cl',
  ].join('\n')
}

export async function compartirPorWhatsApp(completada: Completada, modo: 'individual' | 'colaborativo'): Promise<void> {
  const texto = generarMensajeWhatsApp(completada, modo)
  const encoded = encodeURIComponent(texto)
  const waUrl = `whatsapp://send?text=${encoded}`
  const webUrl = `https://wa.me/?text=${encoded}`

  try {
    const canOpen = await Linking.canOpenURL(waUrl)
    await Linking.openURL(canOpen ? waUrl : webUrl)
  } catch {
    Alert.alert(
      'WhatsApp no disponible',
      'Instalá WhatsApp para compartir la lista de compras.',
    )
  }
}
