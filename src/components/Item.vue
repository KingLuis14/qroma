<template>
  <div class="item">
    <div class="item__imgWrapper" :data-type="item.tipo">
      <img
        :src="
          item.img ||
          'https://upload.wikimedia.org/wikipedia/commons/0/0a/No-image-available.png'
        "
        alt=""
        class="item__img"
      />
    </div>

    <div class="item__content">
      <ul class="item__list">
        <li>{{ item.producto }}</li>
        <li>Envase: {{ item.envase }}</li>
        <!-- <li>Tipo: {{ item.tipo }}</li> -->
        <li>
          Cantidad:
          {{ item.cantidadExpresion ? item.cantidadExpresion : item.cantidad }}
        </li>
        <li class="title">Bulto: {{ formatearBultos(item) }}</li>
      </ul>
      <div class="item__controls">
        <button
          class="button item__btnEditar"
          @click="$emit('increment', item)"
        >
          +
        </button>
        <button class="button item__btnEliminar">x</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ItemStorage } from '../interfaces/Item'

type Item = Omit<ItemStorage, 'cantidad'> & {
  cantidad: number
  color: string
  paq: number
  uni: number
}

const props = defineProps<{
  item: Item
}>()

const emit = defineEmits<{
  (event: 'increment', item: ItemStorage | Item): void
}>()

const formatearBultos = (item: Item) => {
  if (item.tipo === 'balde') {
    return `${item.cantidad} baldes`
  }

  return (
    `${item.paq} paq x ${item.paquete}` +
    (item.uni > 0 ? ` + ${item.uni} uni` : '')
  )
}
</script>

<style scoped>
.item {
  display: grid;
  grid-template-columns: 28% 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.item__content {
  position: relative;
}
.item__list {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.3rem;
  /* background-color: rgba(172, 255, 47, 0.371); */
}
.item__list > li:last-child {
  margin-top: auto;
  text-align: right;
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

.item__imgWrapper {
  position: relative;
  overflow: hidden;

  &[data-type]::before {
    position: absolute;
    top: 0;
    left: 0;
    padding: 0.3em 0.6em;
    color: #fff;
    font-weight: bold;
    font-size: .85rem;
    /* border-radius: 0 0.5em 0.5em 0; */
    content: attr(data-type);
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
