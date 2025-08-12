<template>
  <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem; margin-bottom: 1rem">
    <input type="checkbox" @change="toggleActivo" :checked="activo" />
    <div class="item" :class="[FormManager.isColor(item.tipo) || 'gray', { activo: activo }]">
      <div class="item__content">
        <ul class="item__list">
          <li style="font-weight: 600">{{ item.producto }} {{ item.envase }}</li>
          <li>Cantidad: {{ resumenCantidades.expresion }}</li>
          <li class="bulto">
            {{ item.bulto }}
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
import { ref, computed, onMounted } from 'vue'
import type { Cantidad, Producto } from '../interfaces/Item'
import { FormManager } from '@/scripts/FormControl'

const props = defineProps<{ item: Producto }>()

const activo = ref(false)

const procesarCantidades = (cantidades: Cantidad[]) => {
  const totalCantidad = cantidades.reduce((sum, { cantidad }) => sum + cantidad, 0)
  const expresion = `${cantidades.map((c) => c.cantidad).join(' + ')} = ${totalCantidad}`
  return { expresion }
}

const resumenCantidades = computed(() => procesarCantidades(props.item.cantidades))

const STORAGE_KEY = 'productos_activos'
const productoId = `${props.item.producto}__${props.item.envase}`

const getProductosActivos = (): Set<string> => new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))

const saveProductosActivos = (activos: Set<string>) => localStorage.setItem(STORAGE_KEY, JSON.stringify([...activos]))

const toggleActivo = () => {
  activo.value = !activo.value
  const activos = getProductosActivos()
  activo.value ? activos.add(productoId) : activos.delete(productoId)
  saveProductosActivos(activos)
}

onMounted(() => {
  activo.value = getProductosActivos().has(productoId)
})
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
