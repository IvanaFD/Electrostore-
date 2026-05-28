import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Producto = sequelize.define('Producto', {
  id_producto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  marca: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  precio_venta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  precio_costo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  stock_actual: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  stock_minimo: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  imagen_url: {
    type: DataTypes.STRING(500),
  },
  id_categoria: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_proveedor: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'producto',
  timestamps: false,
  freezeTableName: true,
});

export default Producto;
