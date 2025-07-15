export interface ItemStorage {
  producto: string
  envase: string
  paquete: number,
  img: string,
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
    }[]
  >
}
