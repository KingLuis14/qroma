<template>
  <div>
    <!-- Vista resumen -->
    <ul v-if="modoVista === 'resumen'" class="title-2">
      <li v-for="(grupo, i) in resumen" :key="i">
        {{ grupo.bulto }}
        <template v-if="grupo.totalUni > 0">
          =
          {{ grupo.totalPaq + grupo.totalUni }}
        </template>
      </li>
      ----------------------------
      <br />
      {{
        resumen.reduce((acc, item) => acc + item.totalPaq + item.totalUni, 0)
      }}
      Bultos
    </ul>

    <!-- Vista original -->
    <div v-else>
      <ItemStorage
        v-for="(item, i) in items"
        :key="i"
        :item="item"
        @increment="handleEdit(item)"
      />
      <div>
        <h2>Total de Bultos</h2>
        <br>
        {{
          resumen.reduce((acc, item) => acc + item.totalPaq + item.totalUni, 0)
        }}
        Bultos
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ItemStorage from './Item.vue'

type ItemStorage = {
  producto: string
  envase: string
  paquete: number
  cantidadTextArea: string
  cantidadExpresion?: string
  marca: string
  tipo: 'balde' | 'paq'
  cantidades: Record<
    string,
    {
      color: string
      paq: number
      uni: number
    }
  >
}

type Item = Omit<ItemStorage, 'cantidad'> & {
  cantidad: number // la clave del objeto (ej. "11")
  color: string
  paq: number
  uni: number
}

const items = ref<Item[]>([])
const resumen = ref<
  {
    paquete: string
    items: ItemStorage[]
    totalPaq: number
    totalUni: number
    bulto: string
  }[]
>([])

const modoVista = ref<'global' | 'agrupada' | 'resumen'>('global')

function resumenTotalBultos() {
  const guiaCodigo = localStorage.getItem('guiaActiva')
  if (!guiaCodigo) {
    items.value = []
    return
  }

  const guiaLocalStorage = localStorage.getItem(guiaCodigo)
  const data: ItemStorage[] = guiaLocalStorage
    ? JSON.parse(guiaLocalStorage)
    : {}

  const agrupado = new Map<any, any[]>() // agrupado por paquete (string)

  for (const [producto, detalles] of Object.entries(data)) {
    const paquete = detalles.paquete // puede ser "1", "4", etc.

    if (!agrupado.has(paquete)) {
      agrupado.set(paquete, [])
    }

    agrupado.get(paquete)!.push({
      ...detalles,
      producto,
    })
  }

  const result = Object.fromEntries(agrupado)

  const resultArray = Object.entries(
    result as Record<string, ItemStorage[]>,
  ).map(([paquete, items]) => {
    let totalPaq = 0
    let totalUni = 0
    const tipo = items[0]?.tipo // asumimos mismo tipo en el grupo

    for (const item of items) {
      const cantidades = Object.values(item.cantidades ?? {})
      for (const { paq, uni } of cantidades) {
        totalPaq += paq
        if (tipo === 'paq') totalUni += uni
      }
    }

    const bultoText =
      tipo === 'balde'
        ? `${totalPaq} baldes`
        : `${totalPaq} paq x ${paquete} ${
            totalUni > 0 ? `+ ${totalUni} uni` : ''
          }`

    return {
      paquete,
      items,
      totalPaq,
      totalUni,
      bulto: bultoText,
    }
  })

  resumen.value = resultArray
  // console.log(resultArray)
}

function cargarVistaAgrupada() {
  modoVista.value = 'agrupada'
  const guiaCodigo = localStorage.getItem('guiaActiva')
  if (!guiaCodigo) {
    items.value = []
    return
  }

  const guiaLocalStorage = localStorage.getItem(guiaCodigo)
  const data: ItemStorage[] = guiaLocalStorage
    ? JSON.parse(guiaLocalStorage)
    : {}

  const result: Item[] = []

  for (const [producto, detalles] of Object.entries(data)) {
    const { cantidades } = detalles

    const keys = Object.keys(cantidades)
  const sumandos = keys.map(Number)
  const totalCantidad = sumandos.reduce((sum, val) => sum + val, 0)

    const { totalPaq, totalUni } = Object.values(cantidades).reduce(
      (acc, { paq, uni }) => {
        acc.totalPaq += paq
        acc.totalUni += uni
        return acc
      },
      { totalPaq: 0, totalUni: 0 },
    )

    result.push({
      ...detalles,
      producto,
      cantidad: totalCantidad,
      cantidadExpresion: `${sumandos.join(' + ')} = ${totalCantidad}`,
      paq: totalPaq,
      uni: totalUni,
      color: 'grupal',
    })
  }

  items.value = result;
  resumenTotalBultos()
  // console.log(result)
}

function cargarVistaGlobal() {
  modoVista.value = 'global'
  const btnGlobal = document.getElementById('btn-global')

  const guiaCodigo = localStorage.getItem('guiaActiva')
  if (!guiaCodigo) {
    items.value = []
    return
  }

  const guiaLocalStorage = localStorage.getItem(guiaCodigo)

  const data: ItemStorage[] = guiaLocalStorage
    ? JSON.parse(guiaLocalStorage)
    : {}

  const result: Item[] = []

  for (const [producto, detalles] of Object.entries(data)) {
    const { cantidades } = detalles

    for (const [cantidadStr, cantiDetalles] of Object.entries(cantidades)) {
      result.push({
        ...detalles,
        producto,
        cantidad: +cantidadStr,
        ...cantiDetalles,
      })
    }
  }

  items.value = result;

  btnGlobal?.classList.add('green')
  resumenTotalBultos()
}


function handleEdit(item: ItemStorage) {
  const dialog = document.getElementById('formDialog') as HTMLDialogElement
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
  ) as HTMLButtonElement
  marcaButton?.click()

  const productoSelect = document.getElementById(
    'productoSelect',
  ) as HTMLInputElement
  const envaseSelect = document.getElementById(
    'envaseSelect',
  ) as HTMLInputElement
  const datosTextarea = document.getElementById('datos') as HTMLTextAreaElement

  if (productoSelect && envaseSelect) {
    productoSelect.value = item.producto
    productoSelect.dispatchEvent(new Event('input', { bubbles: true }))

    envaseSelect.value = productoData.envase
    envaseSelect.dispatchEvent(new Event('input', { bubbles: true }))

    document.querySelector<HTMLInputElement>('#paquete')!.value =
      productoData.paquete || ''
    datosTextarea.value = productoData.cantidadTextArea
  }
}

function handleRemove(item: ItemStorage) {
  console.log('eliminar', item)
}

function activarVistaResumen() {
  modoVista.value = 'resumen'
}

onMounted(() => {
  resumenTotalBultos()
  cargarVistaGlobal()
  window.addEventListener('localStorageUpdate', cargarVistaGlobal)
  window.addEventListener('vista:tipo', cargarVistaAgrupada)
  window.addEventListener('vista:bulto', activarVistaResumen)
})

onBeforeUnmount(() => {
  resumenTotalBultos()
  cargarVistaGlobal()
  window.removeEventListener('localStorageUpdate', cargarVistaGlobal)
  window.removeEventListener('vista:tipo', cargarVistaAgrupada)
  window.removeEventListener('vista:bulto', activarVistaResumen)
})
</script>
