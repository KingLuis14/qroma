<template>
  <div>
    <template v-if="modo === 'tipo'">
      <Item
        v-for="item in items"
        :key="item.producto + '-' + item.tipo"
        :item="item"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </template>

    <template v-else>
      <div v-for="grupo in groupedArray" :key="grupo.tipo" class="grupo">
        <h3
          :class="isColor(grupo.tipo as Producto['tipo']) || 'gray'"
          style="
            background-color: color-mix(in srgb, var(--color-active) 17%, transparent);
            border: 1px solid var(--color-active);
            padding: 0.5rem 1rem;
            width: fit-content;
          "
        >
          {{ grupo.tipo }}
        </h3>
        <br />
        <ul style="display: grid; grid-template-columns: 40% 1fr min-content; gap: 0.65rem">
          <template v-for="producto in grupo.productos" :key="producto.producto">
            <li>{{ producto.producto }}</li>
            <li>{{ producto.bulto }}</li>
            <li>{{ producto.calc?.total }}</li>
          </template>
        </ul>
        <br />
        <hr />
        <br>
        <ul style="display: grid; grid-template-columns: 40% 1fr min-content; gap: 0.65rem"
          v-if="
            sumarTotales(grupo.productos).paq ||
            sumarTotales(grupo.productos).uni ||
            sumarTotales(grupo.productos).total
          "
        >
          <li style="grid-column: 2 / span 1;">
            {{ resumenCantidad(sumarTotales(grupo.productos), grupo.tipo) }}
          </li>
          <li>{{ sumarTotales(grupo.productos).total }}</li>
        </ul>

        <br />
        <br />
      </div>
      <br />
      <br />
      <hr />
      <br />

      <ul>
        <li class="title-2" v-for="(texto, i) in bultosTextuales" :key="i">{{ texto }}</li>
      </ul>
    </template>
  </div>

  <br />
  <br />
  <hr />
  <br />
  <p class="title">Total general de cantidades: {{ totalCantidades }}</p>
  <p class="title">Total de items : {{ totalItems }}</p>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Producto } from '../interfaces/Item'
import Item from './Item.vue'

const items = ref<Producto[]>([])
const modo = ref<'tipo' | 'bulto'>('tipo') // ← por defecto es tipo
const bultosTextuales = ref<string[]>([])

const vistaTipo = () => {
  const guiaCodigo = localStorage.getItem('guiaActiva')
  if (!guiaCodigo) {
    items.value = []
    return
  }

  const datosGuardados = localStorage.getItem(guiaCodigo)
  if (!datosGuardados) return

  const data: Record<string, Producto[]> = JSON.parse(datosGuardados)

  items.value = Object.entries(data).flatMap(([nombre, productos]) =>
    productos.map((producto) => ({
      ...producto,
      producto: nombre, // asegúrate de mantener la propiedad `producto` explícitamente
    })),
  )

  modo.value = 'tipo'
  // console.log(data)
}

function resumenCantidad({ paq, uni }: { paq: number; uni: number }, tipo: string): string {
  if (paq > 0) {
    return `${paq} ${tipo}${uni > 0 ? ' + ' + uni + ' uni' : ''}`;
  } else if (uni > 0) {
    return `${uni} uni`;
  } else {
    return '';
  }
}


function sumarTotales(productos: Producto[]) {
  let paq = 0
  let uni = 0
  let total = 0

  for (const p of productos) {
    if (p.calc) {
      paq += p.calc.paq || 0
      uni += p.calc.uni || 0
      total += p.calc.total || 0
    }
  }

  return { paq, uni, total }
}

const groupedArray = ref<Array<{ tipo: string; productos: Producto[] }>>([])

function viewTipoResult() {
  const guiaCodigo = localStorage.getItem('guiaActiva')
  if (!guiaCodigo) return

  const dataRaw = localStorage.getItem(guiaCodigo)
  if (!dataRaw) return

  const data: Record<string, Producto[]> = JSON.parse(dataRaw)
  const grouped = new Map<string, Producto[]>()

  for (const productos of Object.values(data)) {
    for (const producto of productos) {
      const { tipo, paquete, cantidades, bulto } = producto

      const paq = cantidades.reduce((sum, c) => sum + c.paq, 0)
      const uni = cantidades.reduce((sum, c) => sum + c.uni, 0)

      const bultoTexto = `${paq} ${tipo} (${paq * paquete})`

      if (!grouped.has(tipo)) grouped.set(tipo, [])
      grouped.get(tipo)!.push({ ...producto, bulto })
    }
  }

  groupedArray.value = Array.from(grouped, ([tipo, productos]) => ({ tipo, productos }))
  modo.value = 'bulto'
}

function viewBultos() {
  const guiaCodigo = localStorage.getItem('guiaActiva')
  if (!guiaCodigo) return

  const dataRaw = localStorage.getItem(guiaCodigo)
  if (!dataRaw) return

  const data: Record<string, Producto[]> = JSON.parse(dataRaw)
  const grouped = new Map<string, { tipo: string; totalPaq: number; paquete: number }>()
  let totalUnidades = 0

  for (const productos of Object.values(data)) {
    for (const { tipo, paquete, calc } of productos) {
      const group = grouped.get(tipo)
      if (group) {
        group.totalPaq += calc?.paq!
      } else {
        grouped.set(tipo, { tipo, totalPaq: calc?.paq!, paquete })
      }

      totalUnidades += calc?.uni!
    }
  }

  const textoFinal: string[] = []

  for (const { tipo, totalPaq, paquete } of grouped.values()) {
    if (totalPaq > 0) {
      textoFinal.push(`${totalPaq} ${tipo} (${totalPaq * paquete})`)
    }
  }

  if (totalUnidades > 0) {
    textoFinal.push(`${totalUnidades} balde 1GL (${totalUnidades})`)
  }

  bultosTextuales.value = textoFinal
  modo.value = 'bulto'
}

// import { watch } from 'vue'

// watch(modo, (nuevoModo) => {
//   if (nuevoModo === 'tipo') {
//     vistaTipo()
//   } else if (nuevoModo === 'bulto') {
//     viewTipoResult()
//     viewBultos()
//   }
// })

onMounted(() => {
  vistaTipo()
  // viewTipoResult()
  // viewBultos()

  window.addEventListener('localStorageUpdate', vistaTipo)
  window.addEventListener('vista:bulto', () => {
    viewBultos()
    viewTipoResult()
  })
  window.addEventListener('vista:tipo', vistaTipo)
})

function handleDelete(item: Producto) {
  const guiaCodigo = localStorage.getItem('guiaActiva')
  if (!guiaCodigo) return

  const guiaLocalStorage = localStorage.getItem(guiaCodigo)
  if (!guiaLocalStorage) return

  const data = JSON.parse(guiaLocalStorage)
  const productosDelNombre: Producto[] = data[item.producto]

  if (!productosDelNombre) return

  // Filtrar los productos que NO tienen el mismo tipo
  const productosFiltrados = productosDelNombre.filter((producto: Producto) => producto.tipo !== item.tipo)

  if (productosFiltrados.length > 0) {
    // Aún quedan productos con el mismo nombre, actualizamos la lista
    data[item.producto] = productosFiltrados
  } else {
    // Ya no queda ninguno, eliminamos la clave por completo
    delete data[item.producto]
  }

  localStorage.setItem(guiaCodigo, JSON.stringify(data))
  window.dispatchEvent(new Event('localStorageUpdate'))
}

function handleEdit(item: Producto) {
  const dialog = document.getElementById('formDialog') as HTMLDialogElement
  dialog?.showModal()

  const guiaCodigo = localStorage.getItem('guiaActiva')
  if (!guiaCodigo) return

  const guiaLocalStorage = localStorage.getItem(guiaCodigo)
  if (!guiaLocalStorage) return

  const data = JSON.parse(guiaLocalStorage)
  const productosData: Producto[] = data[item.producto] // ← busca por nombre del producto

  if (!productosData) return

  const product = productosData.find((prod) => prod.tipo === item.tipo)

  if (!product) return

  const marcaButton = document.querySelector(`button[data-marca="${item.marca}"]`) as HTMLButtonElement
  marcaButton?.click()

  const productoSelect = document.getElementById('productoSelect') as HTMLInputElement
  const envaseSelect = document.getElementById('envaseSelect') as HTMLInputElement
  const datosTextarea = document.getElementById('datos') as HTMLTextAreaElement

  if (productoSelect && envaseSelect) {
    productoSelect.value = item.producto
    productoSelect.dispatchEvent(new Event('input', { bubbles: true }))

    envaseSelect.value = product.envase
    envaseSelect.dispatchEvent(new Event('input', { bubbles: true }))

    document.querySelector<HTMLInputElement>('#paquete')!.value = String(product.paquete || '')
    datosTextarea.value = product.cantidadTextArea
  }
}

const totalCantidades = computed(() =>
  items.value.reduce((total, item) => total + item.cantidades.reduce((suma, c) => suma + c.cantidad, 0), 0),
)

const totalItems = computed(() => items.value.reduce((total, item) => total + item.cantidades.length, 0))

const isColor = (tipo: Producto['tipo']) => {
  const colores: Record<Producto['tipo'], string> = {
    'paq x 4': 'green',
    'paq x 2': 'yellow',
    'paq x 9': 'orange',
    'paq x 3': 'orange',
    'balde 4GL': 'fucsia',
    'balde 1GL': 'gray',
    'caja teknocola': 'cyan',
    'caja x 12': 'blue',
    'caja temple 25kg': 'red',
    'caja temple 5 x 5kg': 'red',
    'bolsa temple 25kg': 'lila',
    'bolsa temple 5 x 5kg': 'pink',
  }

  return colores[tipo]
}
</script>
