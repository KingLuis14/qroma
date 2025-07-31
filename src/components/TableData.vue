<template>
  <div>
    <Item v-for="(item, index) in items" :key="index" :item="item" @edit="handleEdit" @delete="handleDelete" />
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

  const data: Record<string, Producto> = JSON.parse(datosGuardados)
  // console.log(Object.entries(data))

  items.value = [
    ...Object.entries(data).map(([nombre, producto]) => ({
      ...producto,
      producto: nombre,
    })),
  ]
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

  // Eliminar producto por nombre
  delete data[item.producto]

  // Guardar actualizado
  localStorage.setItem(guiaCodigo, JSON.stringify(data))

  // Disparar evento para actualizar vista
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
  const productoData = data[item.producto] // ← busca por nombre del producto

  if (!productoData) return

  const marcaButton = document.querySelector(`button[data-marca="${item.marca}"]`) as HTMLButtonElement
  marcaButton?.click()

  const productoSelect = document.getElementById('productoSelect') as HTMLInputElement
  const envaseSelect = document.getElementById('envaseSelect') as HTMLInputElement
  const datosTextarea = document.getElementById('datos') as HTMLTextAreaElement

  if (productoSelect && envaseSelect) {
    productoSelect.value = item.producto
    productoSelect.dispatchEvent(new Event('input', { bubbles: true }))

    envaseSelect.value = productoData.envase
    envaseSelect.dispatchEvent(new Event('input', { bubbles: true }))

    document.querySelector<HTMLInputElement>('#paquete')!.value = productoData.paquete || ''
    datosTextarea.value = productoData.cantidadTextArea
  }
}

const sumarTotalCantidades = () => {
  return items.value.reduce((total, item) => {
    return total + item.cantidades.reduce((suma, c) => suma + c.cantidad, 0)
  }, 0)
}

const totalCantidades = computed(() =>
  items.value.reduce((total, item) => total + item.cantidades.reduce((suma, c) => suma + c.cantidad, 0), 0),
)

const totalItems = computed(() => items.value.reduce((total, item) => total + item.cantidades.length, 0))
</script>
