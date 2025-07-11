<template>
  <div class="item">
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/0/0a/No-image-available.png"
      alt=""
      class="item__img"
    />
    <div class="item__content">
      <ul class="item__list">
        <li>{{ item.producto }}</li>
        <li>Envase: {{ item.envase }}</li>
        <li>Tipo: {{ determinarTipoEnvase(item.envase) }}</li>
        <li>Cantidad: {{ item.cantidad }}</li>
        <li>Bulto: {{ describirProducto(item.cantidad, item.paquete,item.envase) }}</li>
      </ul>
      <div class="item__controls">
        <button
          class="button item__btnEditar"
          @click="$emit('increment', item)"
        >
          +
        </button>
        <button class="button item__btnEliminar" @click="$emit('remove', item)">
          x
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  item: {
    producto: string
    envase: string
    cantidad: number
    paquete: number
  }
}>()

defineEmits<{
  (e: 'increment', item: any): void
  (e: 'remove', item: any): void
}>()

function determinarTipoEnvase(envase: string): string {
  const formato = envase.toLowerCase().replace(/\s/g, '')

  if (formato === '1/4gl') return 'botella'
  if (formato === '1gl') return 'paq'
  if (formato === '3.5gl' || formato === '4gl') return 'balde'

  return 'otro'
}

function describirProducto(cantidad: number, paquete: number, envase: string): string {
  const tipo = determinarTipoEnvase(envase)

  if (tipo === 'balde') {
    return `${cantidad} baldes`
  }

  if (tipo === 'paq') {
    const paquetes = Math.floor(cantidad / paquete)
    const unidades = cantidad % paquete

    const resultado = []

    if (paquetes > 0) {
      resultado.push(`${paquetes} paq x ${paquete}`)
    }

    if (unidades > 0) {
      resultado.push(`${unidades} uni`)
    }

    return resultado.length ? resultado.join(' + ') : '0 unidades'
  }

  // Para 'botella' u otros, solo indicar unidades
  return `${cantidad} uni`
}

</script>

<style scoped>
.item {
  display: grid;
  grid-template-columns: 30% 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}
.item__content {
  position: relative;
}
.item__list {
  display: flex;
  flex-direction: column;
  height: 100%;
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
</style>
