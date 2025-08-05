// src/FormManager.ts
import rawProductos from '@/data/data.json'
import type { Cantidad, Producto, TipoProducto } from '@/interfaces/Item'

export class FormManager {
  private static productos = rawProductos

  static $(id: string) {
    return document.getElementById(id)
  }

  // --- Helpers de búsqueda optimizados ---
  static getProducto(nombre: string) {
    return this.productos.find((p) => p.nombre === nombre) ?? null
  }

  static getPresentaciones(nombre: string) {
    return this.getProducto(nombre)?.presentaciones ?? []
  }

  static getEnvases(nombre: string) {
    return this.getPresentaciones(nombre).map((p) => p.envase)
  }

  static getPresentacion(nombre: string, envase: string) {
    return this.getPresentaciones(nombre).find((p) => p.envase === envase) ?? null
  }

  static getTipoProducto(nombre: string, envase: string) {
    return this.getPresentacion(nombre, envase)?.tipo ?? null
  }

  static getPaquete(nombre: string, envase: string) {
    return this.getPresentacion(nombre, envase)?.paquete ?? null
  }

  static getProductosByMarca(marca: string) {
    return this.productos.filter((p) => p.marca === marca).map((p) => p.nombre)
  }

  static createSelectOptions(select: HTMLSelectElement, options: string[], placeholder: string) {
    select.innerHTML = `<option value="">${placeholder}</option>`
    const fragment = document.createDocumentFragment()
    for (const value of options) {
      const option = document.createElement('option')
      option.value = option.textContent = value
      fragment.appendChild(option)
    }
    select.appendChild(fragment)
  }

  static calcularTotal(texto: string) {
    const lineas = texto.trim().split('\n')
    let total = 0
    const sumandos: number[] = []

    for (const linea of lineas) {
      const cantidad = parseInt(linea.split(',')[0]?.trim(), 10)
      if (!isNaN(cantidad)) {
        total += cantidad
        sumandos.push(cantidad)
      }
    }

    return { total, sumandos }
  }

  static procesarTextArea(texto: string, paquete: number) {
    const lineas = texto.trim().split('\n')
    const resultado: Array<{
      cantidad: number
      color: string
      paq: number
      uni: number
    }> = []

    for (const linea of lineas) {
      if (!linea.trim()) continue

      const [cantidadStr, color = 'estandar'] = linea.split(',').map((s) => s.trim())
      const cantidad = parseInt(cantidadStr, 10)

      if (!isNaN(cantidad)) {
        const paq = Math.floor(cantidad / paquete)
        const uni = cantidad % paquete
        resultado.push({ cantidad, color, paq, uni })
      }
    }

    return resultado
  }

  static init() {
    const productoSelect = this.$('productoSelect') as HTMLSelectElement
    const envaseSelect = this.$('envaseSelect') as HTMLSelectElement
    const paqueteInput = this.$('paquete') as HTMLInputElement
    const resultadoInput = this.$('resultado')!
    const guiaInput = this.$('guia') as HTMLInputElement
    const datosInput = this.$('datos') as HTMLTextAreaElement

    document.querySelector('.button-panel')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      const button = target.closest('button[data-marca]') as HTMLElement
      if (!button) return

      document.querySelectorAll('button[data-marca]').forEach((btn) => btn.removeAttribute('active'))
      button.setAttribute('active', '')

      const marca = button.dataset.marca!
      const productos = this.getProductosByMarca(marca)
      this.createSelectOptions(productoSelect, productos, `Productos de ${marca}`)

      envaseSelect.innerHTML = `<option value="">Selecciona</option>`
      paqueteInput.value = ''
    })

    productoSelect.addEventListener('input', () => {
      const envases = this.getEnvases(productoSelect.value)
      this.createSelectOptions(envaseSelect, envases, 'Selecciona')
      paqueteInput.value = ''
    })

    envaseSelect.addEventListener('input', () => {
      const paquete = this.getPaquete(productoSelect.value, envaseSelect.value)
      if (paquete !== null) paqueteInput.value = String(paquete)
    })

    datosInput.addEventListener('input', () => {
      const { total, sumandos } = this.calcularTotal(datosInput.value)
      resultadoInput.textContent = `Total Bultos : ${sumandos.join(' + ')} = ${total}`
    })

    this.$('calcularBtn')?.addEventListener('click', (e) => {
      e.preventDefault()

      const form = document.querySelector('#formDialog form') as HTMLFormElement
      if (!form.checkValidity()) {
        form.reportValidity()
        console.log('erro')

        return
      }
      const producto = productoSelect.value
      if (!producto) return

      const cantidades = this.procesarTextArea(datosInput.value, +paqueteInput.value)

      const resumenCantidades = this.procesarCantidades(cantidades, +paqueteInput.value)

      const activeBtn = document.querySelector<HTMLElement>('button[data-marca][active]')
      const datosFormulario: Producto = {
        producto,
        envase: envaseSelect.value,
        paquete: +paqueteInput.value,
        img: activeBtn?.querySelector('img')?.src ?? '',
        cantidadTextArea: datosInput.value.trim(),
        marca: activeBtn?.dataset.marca ?? '',
        tipo: this.getTipoProducto(producto, envaseSelect.value) as TipoProducto,
        cantidades,
        calc: {
          paq: resumenCantidades.paq,
          uni: resumenCantidades.uni,
          total: resumenCantidades.totalCantidad
        },
        bulto:
          resumenCantidades.paq > 0
            ? `${resumenCantidades.paq} ${ this.getTipoProducto(producto, envaseSelect.value) as TipoProducto }${
                resumenCantidades.uni > 0 ? ' + ' + resumenCantidades.uni + ' uni' : ''
              }`
            : `${resumenCantidades.uni} uni`,
      }

      const codigoGuia = guiaInput.value
      const datosEnLocalStorage = localStorage.getItem(codigoGuia)

      const mapaProductosPorNombre = datosEnLocalStorage
        ? new Map(Object.entries(JSON.parse(datosEnLocalStorage)))
        : new Map()

      const listaProductosExistentes: Producto[] = mapaProductosPorNombre.get(producto) || []

      const yaExisteProductoConMismoTipo = listaProductosExistentes.some(
        (productoExistente) => productoExistente.tipo === datosFormulario.tipo,
      )

      const listaActualizada = yaExisteProductoConMismoTipo
        ? listaProductosExistentes.map((productoExistente) =>
            productoExistente.tipo === datosFormulario.tipo ? datosFormulario : productoExistente,
          )
        : [...listaProductosExistentes, datosFormulario] // Agrega si no existe

      mapaProductosPorNombre.set(producto, listaActualizada)

      localStorage.setItem(codigoGuia, JSON.stringify(Object.fromEntries(mapaProductosPorNombre)))

      window.dispatchEvent(new Event('localStorageUpdate'))
      window.dispatchEvent(new Event('vista:bulto'))
      this.resetFormulario()
    })
  }

  static resetFormulario() {
    const productoSelect = this.$('productoSelect') as HTMLSelectElement
    const envaseSelect = this.$('envaseSelect') as HTMLSelectElement
    const paqueteInput = this.$('paquete') as HTMLInputElement
    const resultadoInput = this.$('resultado')!
    const datosInput = this.$('datos') as HTMLTextAreaElement

    // Limpia selects
    productoSelect.innerHTML = `<option value="">-- Producto --</option>`
    envaseSelect.innerHTML = `<option value="">-- Env --</option>`

    // Limpia valores
    paqueteInput.value = ''
    datosInput.value = ''
    resultadoInput.textContent = 'Total Bultos'

    // Limpia botones activos
    document.querySelectorAll('button[data-marca]').forEach((btn) => {
      btn.removeAttribute('active')
    })
    ;(document.getElementById('formDialog') as HTMLDialogElement)?.close()
  }

  static procesarCantidades(cantidades: Cantidad[], paquete: number) {
    const resumen = cantidades.reduce(
      (acc, { cantidad }) => {
        acc.totalCantidad += cantidad
        acc.expresion.push(cantidad)
        return acc
      },
      { totalCantidad: 0, expresion: [] as number[] },
    )

    const paq = Math.floor(resumen.totalCantidad / paquete)
    const uni = resumen.totalCantidad % paquete

    return {
      ...resumen,
      expresion: `${resumen.expresion.join(' + ')} = ${resumen.totalCantidad}`,
      paq,
      uni,
    }
  }
}
