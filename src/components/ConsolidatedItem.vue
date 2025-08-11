<template>
  <div class="item" :class="isColor(tipo as Producto['tipo']) || 'gray'">
    <h3 style="color: gray; margin-bottom: 0.5rem">{{ tipo }}</h3>
    <ul class="list">
      <template v-for="item in items" :key="item.producto">
        <li>{{ item.producto }}</li>
        <li>{{ item.bulto }}</li>
        <li>{{ item.calc?.total }}</li>
      </template>
    </ul>
    <hr />

    <ul class="list-totales">
      <li style="grid-column: 2 / span 1" class="bulto">
        {{ FormManager.formatBulto(totals.paq, totals.uni, tipo) }}
      </li>
      <li>{{ totals.total }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Producto, TipoProducto } from '@/interfaces/Item'
import { FormManager } from '@/scripts/FormControl'
import { computed } from 'vue'

const props = defineProps<{
  items: Producto[]
  tipo: TipoProducto
}>()

const totals = computed(() => sumarTotales(props.items))

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
    'unidades' : 'gray'
  }

  return colores[tipo]
}
</script>

<style scoped>
.item {
  padding: 1.25rem 1rem;
  border-radius: 4px 8px 8px 4px;
  border-left: 5px solid var(--color-active, transparent);
  display: grid;
  margin-bottom: 1.5rem;
  gap: 0.85rem;
  background-color: #0f1011;
}

.list,
.list-totales {
  display: grid;
  grid-template-columns: 38% 1fr min-content;
  gap: 0.65rem;
  /* font-size: .75rem; */
  /* background-color: rgba(220, 20, 60, 0.354); */
}

.bulto {
  background-color: color-mix(in srgb, var(--color-active) 17%, transparent);
  border: 1px solid var(--color-active);
  width: max-content;
  padding: 0.25em 0.75em;
  margin-left: -0.75rem;
  
}
</style>
