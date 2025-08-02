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
       <ul>
        <li  class="title-2" v-for="(texto, i) in bultosTextuales" :key="i">{{ texto }}</li>
      </ul>
    </template>
  </div>

  <br>
  <br>
  <hr>
   <br>
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


function viewBultos() {
  const guiaCodigo = localStorage.getItem('guiaActiva');
  if (!guiaCodigo) return;

  const dataRaw = localStorage.getItem(guiaCodigo);
  if (!dataRaw) return;

  const data: Record<string, Producto[]> = JSON.parse(dataRaw);
  const grouped = new Map<string, { tipo: string; totalPaq: number; paquete: number }>();
  let totalUnidades = 0;

  for (const productos of Object.values(data)) {
    for (const { tipo, paquete, cantidades } of productos) {
      const paq = cantidades.reduce((sum, c) => sum + c.paq, 0);
      const uni = cantidades.reduce((sum, c) => sum + c.uni, 0);

      const group = grouped.get(tipo);
      if (group) {
        group.totalPaq += paq;
      } else {
        grouped.set(tipo, { tipo, totalPaq: paq, paquete });
      }

      totalUnidades += uni;
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




onMounted(() => {
  vistaTipo()

  window.addEventListener('localStorageUpdate', vistaTipo)
  window.addEventListener('vista:bulto', viewBultos);
  window.addEventListener('vista:tipo', vistaTipo);
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
  const productosFiltrados = productosDelNombre.filter(
    (producto: Producto) => producto.tipo !== item.tipo
  )

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
</script>
