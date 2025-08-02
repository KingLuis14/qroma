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


export interface Cantidad {
  cantidad: number;
  color: string;
  paq: number;
  uni: number;
}

export interface Producto {
  producto: string;
  envase: string;
  paquete: number;
  cantidadTextArea: string;
  cantidadExpresion?: string;
  marca: string;
  img : string
  tipo: TipoProducto;
  cantidades: Cantidad[];
}

export type ProductosPorNombre = {
  [nombre: string]: Producto[];
};


export type ProductoResumen = {
  producto: string
  paquete: number
  tipo: TipoProducto
  totalPaq: number
  totalUni: number
  bulto: string
  cantidad: number
}

export type TipoProducto = 'paq x 9' | 'paq x 4' | 'paq x 2' | 'Balde 4GL' | 'Caja x 4' | 'balde 1GL' 