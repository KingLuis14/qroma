<template>
  <div>
    <Item v-for="item in items" :key="item.producto" :item="item" @edit="handleEdit" @delete="handleDelete" />
  </div>
  <p>Total general de cantidades: {{ totalCantidades }}</p>
  <p>Total de items : {{ totalItems }}</p>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Producto } from '../interfaces/Item'
import Item from './Item.vue'

const items = ref<Producto[]>([])

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

  // console.log(data)
}

onMounted(() => {
  vistaTipo()

  window.addEventListener('localStorageUpdate', vistaTipo)
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
