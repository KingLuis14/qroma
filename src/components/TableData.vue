<template>
  <div>
    <Item
      v-for="(item, i) in items"
      :key="i"
      :item="item"
      @increment="handleEdit"
      @remove="handleRemove"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Item from './Item.vue'

const items = ref([])

function cargarDatos() {
  const guiaCodigo = localStorage.getItem('guiaActiva')
  if (!guiaCodigo) {
    items.value = []
    return
  }

  const guiaLocalStorage = localStorage.getItem(guiaCodigo)

  const data = guiaLocalStorage ? JSON.parse(guiaLocalStorage) : {}

  const result = []

  for (const [producto, detalles] of Object.entries(data)) {
    const { envase, paquete, cantidad, marca } = detalles

    for (const [cantidadStr, color] of Object.entries(cantidad)) {
      result.push({
        producto,
        envase,
        paquete,
        marca,
        cantidad: cantidadStr,
        color,
      })
    }
  }

  items.value = result
  // console.log(result);
}

function handleEdit(item) {
  const dialog = document.getElementById('formDialog')
  dialog?.showModal()

  const guiaCodigo = localStorage.getItem('guiaActiva')
  if (!guiaCodigo) return

  const guiaLocalStorage = localStorage.getItem(guiaCodigo)
  if (!guiaLocalStorage) return

  const data = JSON.parse(guiaLocalStorage)
  const productoData = data[item.producto] // ← busca por nombre del producto


  if (!productoData) return

  const marcaButton = document.querySelector(
    `button[data-marca="${item.marca}"]`,
  )
  marcaButton.click()

  const productoSelect = document.getElementById('productoSelect')
  const envaseSelect = document.getElementById('envaseSelect')
  const datosTextarea = document.getElementById('datos')

  if (productoSelect && envaseSelect) {
  productoSelect.value = item.producto
  productoSelect.dispatchEvent(new Event('input', { bubbles: true }))

  envaseSelect.value = productoData.envase
  envaseSelect.dispatchEvent(new Event('input', { bubbles: true }))

  document.getElementById('paquete').value = productoData.paquete || ''
  datosTextarea.value = productoData.cantidadStr
}
}

function handleRemove(item) {
  console.log('eliminar', item)
}

onMounted(() => {
  cargarDatos()
  window.addEventListener('localStorageUpdate', cargarDatos)
})

onBeforeUnmount(() => {
  window.removeEventListener('localStorageUpdate', cargarDatos)
})
</script>
