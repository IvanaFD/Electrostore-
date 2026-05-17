import { cartReducer } from '../contexts/CartContext'

const estadoVacio = { items: [] }

const producto = {
    id_producto: 1,
    nombre: 'Teclado Mecánico',
    precio_venta: 150,
    stock_actual: 10,
    cantidad: 1,
}

describe('cartReducer', () => {
    test('ADD_ITEM agrega un producto nuevo al carrito', () => {
        const estado = cartReducer(estadoVacio, { type: 'ADD_ITEM', payload: producto })
        expect(estado.items).toHaveLength(1)
        expect(estado.items[0].id_producto).toBe(1)
    })

    test('ADD_ITEM suma la cantidad si el producto ya existe', () => {
        const estadoInicial = { items: [{ ...producto, cantidad: 2 }] }
        const estado = cartReducer(estadoInicial, {
            type: 'ADD_ITEM',
            payload: { ...producto, cantidad: 3 },
        })
        expect(estado.items).toHaveLength(1)
        expect(estado.items[0].cantidad).toBe(5)
    })

    test('REMOVE_ITEM elimina el producto del carrito', () => {
        const estadoInicial = { items: [producto] }
        const estado = cartReducer(estadoInicial, { type: 'REMOVE_ITEM', payload: 1 })
        expect(estado.items).toHaveLength(0)
    })

    test('UPDATE_QUANTITY con cantidad 0 elimina el producto', () => {
        const estadoInicial = { items: [{ ...producto, cantidad: 3 }] }
        const estado = cartReducer(estadoInicial, {
            type: 'UPDATE_QUANTITY',
            payload: { id_producto: 1, cantidad: 0 },
        })
        expect(estado.items).toHaveLength(0)
    })
})
