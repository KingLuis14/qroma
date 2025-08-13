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
      <template v-for="grupo in groupedArray">
        <ConsolidatedItem :items="grupo.productos" :tipo="grupo.tipo" />
      </template>

      <h3 class="title-2">Bultos</h3>
      <br />
      <ul class="list title-2">
        <template v-for="(bulto, i) in bultosTextuales" :key="i">
          <li>{{ bulto.cantidad }}</li>
          <li>{{ bulto.tipo }}</li>
          <li style="margin-left: 1.5rem">({{ bulto.total }})</li>
        </template>
      </ul>
    </template>
  </div>

  <br />
  <br />
  <hr />
  <br />
  <p class="title-2">Total general de cantidades: {{ totalCantidades }}</p>
  <p class="title-2">Total de items : {{ totalItems }}</p>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Producto, TipoProducto } from '../interfaces/Item'
import Item from './Item.vue'
import ConsolidatedItem from './ConsolidatedItem.vue'

type BultoTexto = {
  cantidad: number
  tipo: TipoProducto
  total: number
}

const items = ref<Producto[]>([])
const modo = ref<'tipo' | 'bulto'>('tipo')
const bultosTextuales = ref<BultoTexto[]>([])

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
      producto: nombre,
    })),
  )

  modo.value = 'tipo'
}

const groupedArray = ref<Array<{ tipo: TipoProducto; productos: Producto[] }>>([]);

function viewTipoResult() {
  const guiaCodigo = localStorage.getItem('guiaActiva')
  if (!guiaCodigo) return

  const dataRaw = localStorage.getItem(guiaCodigo)
  if (!dataRaw) return

  const data: Record<TipoProducto, Producto[]> = JSON.parse(dataRaw)
  const grouped = new Map<TipoProducto, Producto[]>()

  for (const productos of Object.values(data)) {
    for (const producto of productos) {
      const { tipo, bulto } = producto

      if (!grouped.has(tipo)) grouped.set(tipo, [])
      grouped.get(tipo)!.push({ ...producto, bulto })
    }
  }

  groupedArray.value = Array.from(grouped, ([tipo, productos]) => ({ tipo, productos }))
  modo.value = 'bulto'
}

function viewBultos() {
  if (!groupedArray.value.length) return

  let totalUnidades = 0
  const textoFinal: BultoTexto[] = []

  for (const { tipo, productos } of groupedArray.value) {
    let totalPaq = 0
    let paquete = 0

    for (const { paquete: paqSize, calc } of productos) {
      paquete = paqSize
      totalPaq += calc?.paq || 0
      totalUnidades += calc?.uni || 0
    }

    if (totalPaq > 0) {
      textoFinal.push({
        cantidad: totalPaq,
        tipo,
        total: totalPaq * paquete,
      })
    }
  }

  if (totalUnidades > 0) {
    textoFinal.push({
      cantidad: totalUnidades,
      tipo: 'unidades',
      total: totalUnidades,
    })
  }

  bultosTextuales.value = textoFinal
  modo.value = 'bulto'
}

onMounted(() => {
  vistaTipo()

  window.addEventListener('localStorageUpdate', vistaTipo)
  window.addEventListener('vista:bulto', () => {
    viewTipoResult()
    viewBultos()
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

  const productosFiltrados = productosDelNombre.filter((producto: Producto) => producto.tipo !== item.tipo)

  if (productosFiltrados.length > 0) {
    data[item.producto] = productosFiltrados
  } else {
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
</script>

<style scoped>
.list {
  display: grid;
  grid-template-columns: repeat(3, max-content);
  gap: 0.75rem 1.2rem;
}
</style>
