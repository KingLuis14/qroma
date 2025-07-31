<template>
  <div class="item" :class="{ activo: activo }">
    <input type="checkbox" @change="toggleActivo" :checked="activo" />

    <div class="item__imgWrapper" :data-type="item.tipo">
      <img
        :src="
          item.img || 'https://upload.wikimedia.org/wikipedia/commons/0/0a/No-image-available.png'
        "
        alt=""
        class="item__img"
      />
    </div>

    <div class="item__content">
      <ul class="item__list">
        <li>{{ item.producto }} {{ item.envase }}</li>
        <li>Cantidad: {{ resumenCantidades.expresion }}</li>
        <li class="bulto">
          Bulto:
          {{
            resumenCantidades.totalPaq +
            ' ' +
            item.tipo +
            (resumenCantidades.totalUni > 0 ? ' + ' + resumenCantidades.totalUni + ' uni' : '')
          }}
        </li>
      </ul>

      <div class="item__controls">
        <button class="button item__btnEditar" @click="$emit('edit', item)">+</button>
        <button class="button item__btnEliminar" @click="$emit('delete', item)" >x</button>
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
    { totalPaq: 0, totalUni: 0, totalCantidad: 0, expresion: [] as number[] }
  )

  return {
    ...resumen,
    expresion: `${resumen.expresion.join(' + ')} = ${resumen.totalCantidad}`
  }
}

// 🔁 Recalcular cuando cambian los props reactivos
const resumenCantidades = computed(() =>
  procesarCantidades(props.item.cantidades)
)

const toggleActivo = () => {
  activo.value = !activo.value
}
</script>


<style scoped>
.item {
  display: grid;
  grid-template-columns: 1rem 28% 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem 0.5rem;
  border-radius: 0.5rem;

  &.activo {
    background-color: #0f1011;

    .item__imgWrapper img {
      filter: grayscale(1);
    }

    .bulto {
      background-color: rgb(96, 96, 96, 0.17);
      border: 1px solid #606060;
      width: fit-content;
      padding: 0.2em 0.5em;
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
  background-color: rgba(59, 200, 54, 0.17);
  border: 1px solid #3bc836;
  width: fit-content;
  padding: 0.2em 0.5em;
}

.item__imgWrapper {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16/9;

  > img{
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
