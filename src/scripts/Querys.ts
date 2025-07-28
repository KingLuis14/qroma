import productoData from '../../prueba.json'
import type {
  Cantidad,
  Producto,
  ProductoResumen,
  ProductosPorNombre,
} from '../interfaces/Item'

const productos = productoData as ProductosPorNombre

const allList = viewProduct()
// console.table(allList)

const bultos = viewBultos(allList, 'Caja x 4')
// console.table(bultos)
const { agrupado, totalUnidades } = agruparPaqYSepararUnidades(allList)

// console.log(agrupado);

for (const item of agrupado) {
  console.log(`${item.totalPaq} ${item.tipo} (${item.totalPaq *  item.paquete})`)
}

console.log(`${totalUnidades} balde 1GL (${totalUnidades})`)

sumaCantidades()

function viewProduct() {
  logTitle('Todos los productos ')
  const results: Array<ProductoResumen> = []

  for (const [producto, values] of Object.entries(productos)) {
    for (const value of values) {
      const { totalPaq, totalUni, totalCantidad } = sumarCantidades(
        value.cantidades,
      )

      results.push({
        producto,
        paquete: value.paquete,
        tipo: value.tipo,
        totalPaq,
        totalUni,
        bulto: `${totalPaq} ${value.tipo}${
          totalUni > 0 ? ` + ${totalUni} uni` : ''
        }`,
        cantidad: totalCantidad,
      })
    }
  }

  return results
}

function agruparPaqYSepararUnidades(array: ProductoResumen[]): {
  agrupado: Array<{ tipo: string; totalPaq: number, paquete: number }>
  totalUnidades: number
} {
  const agrupadoPorTipo: Record<
    string,
    { tipo: string; totalPaq: number, paquete: number }
  > = {}
  let totalUnidades = 0

  for (const item of array) {
    const existente = agrupadoPorTipo[item.tipo] || {
      tipo: item.tipo,
      totalPaq: 0,
      
    }

    agrupadoPorTipo[item.tipo] = {
      tipo: item.tipo,
      totalPaq: existente.totalPaq + item.totalPaq,
      paquete: item.paquete
    }

    totalUnidades += item.totalUni
  }

  const agrupado = Object.values(agrupadoPorTipo).map((data) => ({ ...data }));


  return { agrupado, totalUnidades }
}

function viewBultos(
  array: Array<ProductoResumen>,
  paqueteBuscado: Producto['tipo'],
) {
  logTitle('Productos filtrados por ' + paqueteBuscado)
  return array.filter((item) => item.tipo === paqueteBuscado.toLowerCase())
}

function resultViewBultos() {}

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
