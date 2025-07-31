import productoData from '../../prueba.json'
import type {
  Cantidad,
  Producto,
  ProductoResumen,
  ProductosPorNombre,
} from '../interfaces/Item'

const productos = productoData as ProductosPorNombre

viewGlobal();
const allList = viewProduct()
// console.table(allList)

// viewBultos(allList)

function viewGlobal() {
  logTitle('Todos los productos')
  const results: any[] = []

  for (const [producto, items] of Object.entries(productos)) {
    for (const { paquete, tipo, cantidades } of items) {
      for (const { cantidad, paq, uni, color } of cantidades) {
        results.push({
          producto,
          paquete,
          tipo,
          paq,
          uni,
          cantidad,
          bulto: `${paq} ${tipo}${uni > 0 ? ` + ${uni} uni` : ''}`,
        })
      }
    }
  }

  console.table(results)
  return results
}

function viewProduct(): ProductoResumen[] {
  logTitle('Todos los productos')
  const results: ProductoResumen[] = []

  for (const [producto, items] of Object.entries(productos)) {
    for (const { paquete, tipo, cantidades } of items) {
      const { totalPaq, totalUni, totalCantidad } = sumarCantidades(cantidades)

      results.push({
        producto,
        paquete,
        tipo,
        totalPaq,
        totalUni,
        cantidad: totalCantidad,
        bulto: `${totalPaq} ${tipo}${totalUni > 0 ? ` + ${totalUni} uni` : ''}`,
      })
    }
  }

  return results
}

function viewBultos(array: ProductoResumen[]) {
  logTitle('Todos los productos')
  const grouped = new Map<
    string,
    { tipo: string; totalPaq: number; paquete: number }
  >()
  let totalUnidades = 0

  for (const { tipo, totalPaq, paquete, totalUni } of array) {
    const existingGroup = grouped.get(tipo)

    if (existingGroup) {
      existingGroup.totalPaq += totalPaq
    } else {
      grouped.set(tipo, { tipo, totalPaq, paquete })
    }

    totalUnidades += totalUni
  }

  // Imprimir Resultados
  for (const { tipo, totalPaq, paquete } of grouped.values()) {
    console.log(`${totalPaq} ${tipo} (${totalPaq * paquete})`)
  }

  console.log(`${totalUnidades} balde 1GL (${totalUnidades})`)

  sumaCantidades()
}

function sumarCantidades(cantidades: Cantidad[]) {
  return cantidades.reduce(
    (acc, { paq, uni, cantidad }) => {
      acc.totalPaq += paq
      acc.totalUni += uni
      acc.totalCantidad += cantidad
      return acc
    },
    { totalPaq: 0, totalUni: 0, totalCantidad: 0 },
  )
}

function logTitle(title: string) {
  console.log(`\x1b[1m\x1b[43m\x1b[30m  ${title.toUpperCase()}  \x1b[0m`)
}

function filterByProduct(marca: string) {
  const marcaKey = marca.trim()
  const values = productos[marcaKey]

  if (!values) return

  logTitle(`Productos filtrados por: ${marcaKey}`)
  for (const value of values) {
    console.log(value)
  }
}

// filterByProduct('FST SATINADO')

function sumaCantidades() {
  const suma = allList.reduce((acu, item) => {
    acu += item.cantidad
    return acu
  }, 0)

  logTitle('la suma es : ' + suma)
}
