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

  static formatBulto (paq: number, uni: number, type: TipoProducto): string {
    if (paq > 0) {
      return `${paq} ${type}${uni > 0 ? ` + ${uni} uni` : ''}`
    }
    return `${uni} uni`
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

    this.$('calcularBtn')?.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault()

      const formEl = document.querySelector<HTMLFormElement>('#formDialog form')
      if (!formEl?.checkValidity()) {
        formEl?.reportValidity()
        return
      }

      const product = productoSelect.value
      if (!product) return

      const pkgValue = +paqueteInput.value
      const textValue = datosInput.value.trim()
      const typeProduct = this.getTipoProducto(product, envaseSelect.value) as TipoProducto

      const quantities = this.procesarTextArea(textValue, pkgValue)
      const summary = this.procesarCantidades(quantities, pkgValue)

      const activeBtn = document.querySelector<HTMLElement>('button[data-marca][active]')
      const formData: Producto = {
        producto: product,
        envase: envaseSelect.value,
        paquete: pkgValue,
        img: activeBtn?.querySelector<HTMLImageElement>('img')?.src ?? '',
        cantidadTextArea: textValue,
        marca: activeBtn?.dataset.marca ?? '',
        tipo: typeProduct,
        cantidades: quantities,
        calc: {
          paq: summary.paq,
          uni: summary.uni,
          total: summary.totalCantidad,
        },
       bulto: this.formatBulto(summary.paq, summary.uni, typeProduct),
      }

      const guideCode = guiaInput.value
      const storedData = localStorage.getItem(guideCode)

      const productsMap = storedData
        ? new Map<string, Producto[]>(Object.entries(JSON.parse(storedData)))
        : new Map<string, Producto[]>()

      const existingList = productsMap.get(product) || []
      const updatedList = existingList.some((p) => p.tipo === formData.tipo)
        ? existingList.map((p) => (p.tipo === formData.tipo ? formData : p))
        : [...existingList, formData]

      productsMap.set(product, updatedList)
      localStorage.setItem(guideCode, JSON.stringify(Object.fromEntries(productsMap)))

      window.dispatchEvent(new Event('localStorageUpdate'))
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

  static isColor(tipo: Producto['tipo']){
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
}
