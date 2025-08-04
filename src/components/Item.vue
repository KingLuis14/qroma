<template>
  <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem; margin-bottom: 1rem">
    <input type="checkbox" @change="toggleActivo" :checked="activo" />
    <div class="item" :class="[isColor(item.tipo) || 'gray', { activo: activo }]">
      <div class="item__content">
        <ul class="item__list">
          <li style="font-weight: 600">{{ item.producto }} {{ item.envase }}</li>
          <li>Cantidad: {{ resumenCantidades.expresion }}</li>
          <li class="bulto">
            Bulto:
            {{
              resumenCantidades.totalPaq > 0
                ? resumenCantidades.totalPaq +
                  ' ' +
                  item.tipo +
                  (resumenCantidades.totalUni > 0 ? ' + ' + resumenCantidades.totalUni + ' uni' : '')
                : resumenCantidades.totalUni > 0
                ? resumenCantidades.totalUni + ' uni'
                : ''
            }}
          </li>
        </ul>

        <div class="item__controls">
          <button class="button item__btnEditar" @click="$emit('edit', item)">+</button>
          <button class="button item__btnEliminar" @click="$emit('delete', item)">x</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Cantidad, Producto } from '../interfaces/Item'

const props = defineProps<{
  item: Producto
}>()

const emit = defineEmits<{
  (e: 'edit', item: Producto): void
  (e: 'delete', item: Producto): void
}>()

const activo = ref(false)

const procesarCantidades = (cantidades: Cantidad[]) => {
  const resumen = cantidades.reduce(
    (acc, { paq, uni, cantidad }) => {
      acc.totalPaq += paq
      acc.totalUni += uni
      acc.totalCantidad += cantidad
      acc.expresion.push(cantidad)
      return acc
    },
    { totalPaq: 0, totalUni: 0, totalCantidad: 0, expresion: [] as number[] },
  )

  return {
    ...resumen,
    expresion: `${resumen.expresion.join(' + ')} = ${resumen.totalCantidad}`,
  }
}

// 🔁 Recalcular cuando cambian los props reactivos
const resumenCantidades = computed(() => procesarCantidades(props.item.cantidades))

const toggleActivo = () => {
  activo.value = !activo.value
}

const isColor = (tipo: Producto['tipo']) => {
  const colores: Record<Producto['tipo'], string> = {
    'paq x 4': 'green',
    'paq x 2': 'yellow',
    'paq x 9': 'orange',
    'balde 4GL': 'fucsia',
    'balde 1GL': 'gray',
    'caja x 4': 'gray',
  }

  return colores[tipo]
}
</script>

<style scoped>
.item {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  /* margin-bottom: 1.5rem; */
  padding: 1.25rem 1rem;
  border-radius: 4px 8px 8px 4px;
  border-left: 5px solid var(--color-active, transparent);
  background-color: #0f1011;

  &.activo {
    --color-active: rgb(108, 108, 108);
    background-color: #272727;

    .item__imgWrapper img {
      filter: grayscale(1);
    }

    .item__btnEditar,
    .item__btnEliminar {
      background-color: #272727;
      border: 1px solid var(--color-active);
    }
  }
}
.item__content {
  position: relative;
}
.item__list {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.5rem;
  /* background-color: rgba(172, 255, 47, 0.371); */
}
.item__list > li:last-child {
  /* margin-top: auto; */
  /* text-align: right; */
}
.item__controls {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 0.5rem;
}

.item__btnEditar {
  width: 20px;
  aspect-ratio: 1;
  border-radius: 50%;
  background-color: #dfab2a;
  padding: 0;
}
.item__btnEliminar {
  width: 20px;
  aspect-ratio: 1;
  border-radius: 50%;
  background-color: #e2282b;
  padding: 0;
}

.bulto {
  position: relative;
  background-color: color-mix(in srgb, var(--color-active) 17%, transparent);
  border: 1px solid var(--color-active);
  width: fit-content;
  padding: 0.25em 0.75em;
}

.item__imgWrapper {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16/9;

  > img {
    height: 100%;
    /* object-fit: contain; */
  }

  &[data-type]::before {
    position: absolute;
    top: 0;
    left: 0;
    padding: 0.3em 0.6em;
    color: #fff;
    font-weight: bold;
    font-size: 0.85rem;
    /* border-radius: 0 0.5em 0.5em 0; */
    /* content: attr(data-type); */
    background-color: var(--type-color);
    transform: rotate(-10deg);
    transform-origin: left bottom;
  }

  &[data-type='paq'] {
    --type-color: crimson;
  }

  &[data-type='balde'] {
    --type-color: rgb(70, 188, 30);
  }
}
</style>
