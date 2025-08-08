<template>
  <div class="item" :class="isColor(tipo as Producto['tipo']) || 'gray'">
    <h3 style="color: gray; margin-bottom: .5rem;">{{ tipo }}</h3>
    <ul class="list">
      <template v-for="item in items" :key="item.producto">
        <li>{{ item.producto }}</li>
        <li>{{ item.bulto }}</li>
        <li>{{ item.calc?.total }}</li>
      </template>
    </ul>
    <hr />

    <ul v-if="sumarTotales(items).total" class="list-totales">
      <li style="grid-column: 2 / span 1" class="bulto">{{ resumenCantidad(sumarTotales(items), tipo) }}</li>
      <li>{{ sumarTotales(items).total }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Producto } from '@/interfaces/Item'

defineProps<{
  items: Producto[]
  tipo: string
}>()

function resumenCantidad({ paq, uni }: { paq: number; uni: number }, tipo: string): string {
  if (paq > 0) {
    return `${paq} ${tipo}${uni > 0 ? ' + ' + uni + ' uni' : ''}`
  } else if (uni > 0) {
    return `${uni} uni`
  } else {
    return ''
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

<style scoped>
.item {
  padding: 1.25rem 1rem;
  border-radius: 4px 8px 8px 4px;
  border-left: 5px solid var(--color-active, transparent);
  display: grid;
  margin-bottom: 1.5rem;
  gap: .85rem;
  background-color: #0f1011;
}

.list,
.list-totales {
  display: grid;
  grid-template-columns: 38% 1fr min-content;
  gap: 0.65rem;
}

.bulto{
    background-color: color-mix(in srgb, var(--color-active) 17%, transparent);
  border: 1px solid var(--color-active);
  width: fit-content;
  padding: 0.25em 0.75em;
  margin-left: -0.75rem;
}
</style>
