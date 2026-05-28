-- ============================================================
-- Proyecto 3 — Stored Procedures
-- ============================================================

-- SP 1: Registrar venta completa con validación de stock
-- PROCEDURE con transacción explícita y ROLLBACK en caso de error
CREATE OR REPLACE PROCEDURE sp_registrar_venta(
  IN p_id_cliente  INTEGER,
  IN p_id_empleado INTEGER,
  IN p_items       JSONB
)
LANGUAGE plpgsql AS $$
DECLARE
  i          INTEGER;
  v_item     JSONB;
  v_stock    INTEGER;
  v_precio   NUMERIC(10,2);
  v_total    NUMERIC(10,2) := 0;
  v_id_venta INTEGER;
  v_cantidad INTEGER;
  v_id_prod  INTEGER;
BEGIN
  -- Fase 1: Validar stock de todos los ítems antes de modificar nada
  FOR i IN 0..jsonb_array_length(p_items) - 1
  LOOP
    v_item     := p_items->i;
    v_id_prod  := (v_item->>'id_producto')::INTEGER;
    v_cantidad := (v_item->>'cantidad')::INTEGER;

    SELECT stock_actual, precio_venta
    INTO   v_stock, v_precio
    FROM   Producto
    WHERE  id_producto = v_id_prod;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto con id % no encontrado', v_id_prod;
    END IF;

    IF v_stock < v_cantidad THEN
      RAISE EXCEPTION 'Stock insuficiente para producto % (disponible: %, solicitado: %)',
        v_id_prod, v_stock, v_cantidad;
    END IF;

    v_total := v_total + v_precio * v_cantidad;
  END LOOP;

  -- Fase 2: Insertar la venta principal
  INSERT INTO Venta (total, estado, id_cliente, id_empleado)
  VALUES (v_total, 'completada', p_id_cliente, p_id_empleado)
  RETURNING id_venta INTO v_id_venta;

  -- Fase 3: Insertar detalles y descontar stock
  FOR i IN 0..jsonb_array_length(p_items) - 1
  LOOP
    v_item     := p_items->i;
    v_id_prod  := (v_item->>'id_producto')::INTEGER;
    v_cantidad := (v_item->>'cantidad')::INTEGER;

    SELECT precio_venta INTO v_precio
    FROM   Producto WHERE id_producto = v_id_prod;

    INSERT INTO DetalleVenta (id_venta, id_producto, cantidad, precio_unitario, subtotal)
    VALUES (v_id_venta, v_id_prod, v_cantidad, v_precio, v_precio * v_cantidad);

    UPDATE Producto
    SET    stock_actual = stock_actual - v_cantidad
    WHERE  id_producto = v_id_prod;
  END LOOP;

  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END;
$$;


-- SP 2: Cancelar venta y restaurar stock
-- PROCEDURE con transacción explícita y ROLLBACK
CREATE OR REPLACE PROCEDURE sp_cancelar_venta(IN p_id_venta INTEGER)
LANGUAGE plpgsql AS $$
DECLARE
  v_estado VARCHAR(20);
  v_item   RECORD;
BEGIN
  SELECT estado INTO v_estado FROM Venta WHERE id_venta = p_id_venta;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venta % no encontrada', p_id_venta;
  END IF;

  IF v_estado = 'cancelada' THEN
    RAISE EXCEPTION 'La venta % ya está cancelada', p_id_venta;
  END IF;

  -- Restaurar stock por cada ítem del detalle
  FOR v_item IN
    SELECT id_producto, cantidad FROM DetalleVenta WHERE id_venta = p_id_venta
  LOOP
    UPDATE Producto
    SET    stock_actual = stock_actual + v_item.cantidad
    WHERE  id_producto = v_item.id_producto;
  END LOOP;

  UPDATE Venta SET estado = 'cancelada' WHERE id_venta = p_id_venta;

  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END;
$$;


-- SP 3: Recibir orden de compra y actualizar stock de productos
-- PROCEDURE con transacción explícita y ROLLBACK
CREATE OR REPLACE PROCEDURE sp_recibir_orden(IN p_id_orden INTEGER)
LANGUAGE plpgsql AS $$
DECLARE
  v_estado VARCHAR(20);
  v_item   RECORD;
BEGIN
  SELECT estado INTO v_estado FROM OrdenCompra WHERE id_orden = p_id_orden;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orden de compra % no encontrada', p_id_orden;
  END IF;

  IF v_estado = 'recibida' THEN
    RAISE EXCEPTION 'La orden % ya fue recibida', p_id_orden;
  END IF;

  -- Incrementar stock por cada ítem de la orden
  FOR v_item IN
    SELECT id_producto, cantidad FROM DetalleOrden WHERE id_orden = p_id_orden
  LOOP
    UPDATE Producto
    SET    stock_actual = stock_actual + v_item.cantidad
    WHERE  id_producto = v_item.id_producto;
  END LOOP;

  UPDATE OrdenCompra SET estado = 'recibida' WHERE id_orden = p_id_orden;

  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END;
$$;


-- SP 4: Cancelar orden de compra pendiente
-- PROCEDURE con transacción explícita y ROLLBACK
CREATE OR REPLACE PROCEDURE sp_cancelar_orden(IN p_id_orden INTEGER)
LANGUAGE plpgsql AS $$
DECLARE
  v_estado VARCHAR(20);
BEGIN
  SELECT estado INTO v_estado FROM OrdenCompra WHERE id_orden = p_id_orden;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orden de compra % no encontrada', p_id_orden;
  END IF;

  IF v_estado != 'pendiente' THEN
    RAISE EXCEPTION 'Solo se pueden cancelar órdenes pendientes (estado actual: %)', v_estado;
  END IF;

  DELETE FROM DetalleOrden WHERE id_orden = p_id_orden;
  DELETE FROM OrdenCompra  WHERE id_orden = p_id_orden;

  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END;
$$;


-- SP 5: Verificar disponibilidad de stock de un producto
-- FUNCTION con parámetros de entrada/salida y manejo de excepciones
CREATE OR REPLACE FUNCTION sp_verificar_stock(
  IN  p_id_producto  INTEGER,
  IN  p_cantidad     INTEGER,
  OUT p_disponible   BOOLEAN,
  OUT p_stock_actual INTEGER,
  OUT p_nombre       TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
  IF p_cantidad IS NULL OR p_cantidad <= 0 THEN
    RAISE EXCEPTION 'La cantidad solicitada debe ser un entero positivo';
  END IF;

  SELECT nombre, stock_actual
  INTO   p_nombre, p_stock_actual
  FROM   Producto
  WHERE  id_producto = p_id_producto;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto con id % no encontrado', p_id_producto;
  END IF;

  p_disponible := (p_stock_actual >= p_cantidad);
END;
$$;


-- Permisos de ejecución sobre los stored procedures

GRANT EXECUTE ON PROCEDURE sp_registrar_venta(INTEGER, INTEGER, JSONB)
  TO rol_admin, rol_vendedor, rol_cliente;
GRANT EXECUTE ON PROCEDURE sp_cancelar_venta(INTEGER)
  TO rol_admin, rol_vendedor, rol_cliente;
GRANT EXECUTE ON PROCEDURE sp_recibir_orden(INTEGER)
  TO rol_admin, rol_bodeguero;
GRANT EXECUTE ON PROCEDURE sp_cancelar_orden(INTEGER)
  TO rol_admin, rol_bodeguero, rol_vendedor;
GRANT EXECUTE ON FUNCTION sp_verificar_stock(INTEGER, INTEGER)
  TO rol_admin, rol_vendedor, rol_cliente, rol_bodeguero, rol_auditor;
