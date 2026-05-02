-- ============================================================
-- ElectroStore - Tienda de Componentes Electrónicos
-- SEED - Datos de prueba
-- Base de datos: PostgreSQL


CREATE EXTENSION IF NOT EXISTS pgcrypto;

---------------------------------------------------------
INSERT INTO Usuario (username, password_hash, rol) VALUES
('admin',     crypt('admin123', gen_salt('bf', 10)), 'admin'),
('empleado1', crypt('em123',    gen_salt('bf', 10)), 'vendedor'),
('empleado2', crypt('emp456',   gen_salt('bf', 10)), 'vendedor'),
('cliente1',  crypt('cl123',    gen_salt('bf', 10)), 'cliente'),
('cliente2',  crypt('cl456',    gen_salt('bf', 10)), 'cliente');

---------------------------------------------------------
-- CATEGORIAS (13)

INSERT INTO Categoria (nombre, descripcion) VALUES
('Boards de Desarrollo',         'Microcontroladores y plataformas de desarrollo como Arduino y ESP32'),
('Sensores',                     'Sensores de temperatura, humedad, movimiento, distancia y más'),
('Módulos',                      'Módulos de comunicación, displays y expansión para proyectos'),
('Resistencias',                 'Resistencias de carbono y película metálica para circuitos'),
('Capacitores',                  'Capacitores electrolíticos y cerámicos para filtrado y almacenamiento'),
('LED',                          'Diodos emisores de luz de distintos colores y tamaños'),
('Herramienta',                  'Herramientas para soldadura, medición y ensamblaje de circuitos'),
('Cable y Alambre',              'Cables dupont, jumpers y alambre para conexiones en proyectos'),
('Fuentes de Poder y Baterías',  'Fuentes reguladas, baterías recargables y módulos de carga'),
('Relés, Pulsadores y Switches', 'Relés de control, pulsadores momentáneos y switches para circuitos'),
('Potenciómetros',               'Potenciómetros lineales y rotativos para control de señal'),
('Motores y Servos',             'Motores DC, servomotores y motores paso a paso'),
('Circuitos Integrados',         'ICs lógicos, amplificadores operacionales y reguladores de voltaje');

---------------------------------------------------------
-- PROVEEDORES (25)

INSERT INTO Proveedor (nombre, nombre_contacto, telefono, email, direccion) VALUES
('Distribuidora ElectroGT',       'Carlos Ramírez',   '2222-3333', 'carlos@electrogt.com',        'Zona 9, Ciudad de Guatemala'),
('Componentes del Sur',           'Ana López',        '5555-4444', 'ana@componentesdelsur.com',    'Zona 4, Ciudad de Guatemala'),
('TechSupply Guatemala',          'Roberto Morales',  '7777-8888', 'roberto@techsupply.gt',        'Zona 12, Ciudad de Guatemala'),
('ElectroMakers GT',              'María Cifuentes',  '3333-2222', 'maria@electromakers.gt',       'Zona 1, Ciudad de Guatemala'),
('Distribuidora Nacional Elec',   'Juan Pérez',       '4444-5555', 'juan@dnelec.com.gt',           'Zona 6, Ciudad de Guatemala'),
('Importadora Tech GT',           'Luis Herrera',     '2345-6789', 'luis@importadoratech.gt',      'Zona 10, Ciudad de Guatemala'),
('ElectroPartes Centro',          'Sandra Vásquez',   '5678-9012', 'sandra@electropartes.com',     'Zona 3, Ciudad de Guatemala'),
('Suministros Electrónicos SA',   'Pedro Castillo',   '6789-0123', 'pedro@suministrose.com',       'Zona 7, Ciudad de Guatemala'),
('TechZone Guatemala',            'Claudia Mejía',    '7890-1234', 'claudia@techzone.gt',          'Mixco, Guatemala'),
('Distribuidora Omega Elec',      'Fernando Ruiz',    '8901-2345', 'fernando@omegaelec.gt',        'Villa Nueva, Guatemala'),
('ElectroSur Guatemala',          'Patricia Lemus',   '9012-3456', 'patricia@electrosur.gt',       'Zona 11, Ciudad de Guatemala'),
('Mayorista Electrónico GT',      'Alejandro Cruz',   '2345-6780', 'alejandro@mayoristaelec.gt',   'Zona 2, Ciudad de Guatemala'),
('Partes y Componentes SA',       'Viviana Torres',   '3456-7891', 'viviana@partesycomp.com',      'Zona 5, Ciudad de Guatemala'),
('ElectroImport GT',              'Marcos Fuentes',   '4567-8902', 'marcos@electroimport.gt',      'Zona 8, Ciudad de Guatemala'),
('Distribuidora Alfa Elec',       'Isabel González',  '5678-9013', 'isabel@alfaelec.gt',           'Zona 13, Ciudad de Guatemala'),
('TechComponents Guatemala',      'Ricardo Mendoza',  '6789-0124', 'ricardo@techcomp.gt',          'Zona 14, Ciudad de Guatemala'),
('Electrónica Universal GT',      'Carmen Soto',      '7890-1235', 'carmen@electrouniversal.gt',   'Zona 15, Ciudad de Guatemala'),
('Distribuidora Beta Elec',       'Ernesto Reyes',    '8901-2346', 'ernesto@betaelec.com.gt',      'Zona 16, Ciudad de Guatemala'),
('Importaciones Electrónicas CR', 'Gabriela Mora',    '9012-3457', 'gabriela@importelecCR.com',    'San José, Costa Rica'),
('ElectroDistrib MX',             'Héctor Jiménez',   '2345-6781', 'hector@electrodistribMX.com',  'Ciudad de México, México'),
('Componentes Asia GT',           'Mei Lin',          '3456-7892', 'mei@componentesasia.gt',       'Zona 9, Ciudad de Guatemala'),
('Suministros Maker GT',          'David Orellana',   '4567-8903', 'david@suministrosmaker.gt',    'Zona 1, Ciudad de Guatemala'),
('ElectroPlus Guatemala',         'Rebeca Pineda',    '5678-9014', 'rebeca@electroplus.gt',        'Zona 10, Ciudad de Guatemala'),
('Distribuidora Gamma Tech',      'Andrés Maldonado', '6789-0125', 'andres@gammatech.gt',          'Mixco, Guatemala'),
('TechWorld GT',                  'Lorena Aguilar',   '7890-1236', 'lorena@techworldgt.com',       'Villa Nueva, Guatemala');

---------------------------------------------------------
-- EMPLEADOS (25)

INSERT INTO Empleado (nombre, apellido, email, telefono, cargo, id_usuario) VALUES
('Pedro',      'Martinez',  'pedro@electrostore.com',       '5555-7777', 'vendedor',   2),
('Laura',      'Gomez',     'laura@electrostore.com',       '5555-8888', 'vendedor',   3),
('Miguel',     'Soto',      'miguel.s@electrostore.com',    '5555-8001', 'vendedor',   NULL),
('Carmen',     'Reyes',     'carmen.r@electrostore.com',    '5555-8002', 'vendedor',   NULL),
('Jorge',      'Hernandez', 'jorge.h@electrostore.com',     '5555-8003', 'bodeguero',  NULL),
('Fabiola',    'Martinez',  'fabiola.m@electrostore.com',   '5555-8004', 'vendedor',   NULL),
('Andres',     'Diaz',      'andres.d@electrostore.com',    '5555-8005', 'vendedor',   NULL),
('Rosa',       'Lopez',     'rosa.l@electrostore.com',      '5555-8006', 'vendedor',   NULL),
('Hector',     'Perez',     'hector.p@electrostore.com',    '5555-8007', 'bodeguero',  NULL),
('Silvia',     'Paz',       'silvia.p@electrostore.com',    '5555-8008', 'vendedor',   NULL),
('Juan',       'Morales',   'juanc.m@electrostore.com',     '5555-8009', 'supervisor', NULL),
('Elena',      'Torres',    'elena.t@electrostore.com',     '5555-8010', 'vendedor',   NULL),
('Roberto',    'Cruz',      'roberto.c@electrostore.com',   '5555-8011', 'vendedor',   NULL),
('Mariana',    'Fuentes',   'mariana.f@electrostore.com',   '5555-8012', 'vendedor',   NULL),
('Daniel',     'Ruiz',      'daniel.r@electrostore.com',    '5555-8013', 'bodeguero',  NULL),
('Patricia',   'Mejia',     'patricia.m@electrostore.com',  '5555-8014', 'vendedor',   NULL),
('Luis',       'Castillo',  'luisf.c@electrostore.com',     '5555-8015', 'vendedor',   NULL),
('Claudia',    'Ramos',     'claudia.r@electrostore.com',   '5555-8016', 'vendedor',   NULL),
('Sergio',     'Gonzalez',  'sergio.g@electrostore.com',    '5555-8017', 'bodeguero',  NULL),
('Natalia',    'Solis',     'natalia.s@electrostore.com',   '5555-8018', 'vendedor',   NULL),
('Victor',     'Aguilar',   'victor.a@electrostore.com',    '5555-8019', 'vendedor',   NULL),
('Adriana',    'Sandoval',  'adriana.s@electrostore.com',   '5555-8020', 'vendedor',   NULL),
('Francisco',  'Lemus',     'francisco.l@electrostore.com', '5555-8021', 'supervisor', NULL),
('Gloria',     'Cifuentes', 'gloria.c@electrostore.com',    '5555-8022', 'vendedor',   NULL),
('Emilio',     'Arriaga',   'emilio.a@electrostore.com',    '5555-8023', 'bodeguero',  NULL);

---------------------------------------------------------
-- CLIENTES (25)


INSERT INTO Cliente (nombre, apellido, email, telefono, direccion, id_usuario) VALUES
('Luis',      'García',    'luis.garcia@gmail.com',     '5555-0001', 'Zona 10, Ciudad de Guatemala', 4),
('María',     'López',     'maria.lopez@gmail.com',     '5555-0002', 'Zona 15, Ciudad de Guatemala', 5),
('Carlos',    'Martínez',  'carlos.m@hotmail.com',      '5555-0003', 'Mixco, Guatemala',              NULL),
('Andrea',    'González',  'andrea.g@gmail.com',        '5555-0004', 'Villa Nueva, Guatemala',        NULL),
('Diego',     'Ramírez',   'diego.r@outlook.com',       '5555-0005', 'Zona 7, Guatemala',             NULL),
('Fernanda',  'Cifuentes', 'fer.cif@gmail.com',         '5555-0006', 'San Miguel Petapa, Guatemala',  NULL),
('Pablo',     'Morales',   'pablo.m@gmail.com',         '5555-0007', 'Zona 6, Guatemala',             NULL),
('Sofía',     'Hernández', 'sofia.h@hotmail.com',       '5555-0008', 'Zona 2, Guatemala',             NULL),
('Roberto',   'Juárez',    'roberto.j@gmail.com',       '5555-0009', 'Amatitlán, Guatemala',          NULL),
('Valeria',   'Castillo',  'valeria.c@gmail.com',       '5555-0010', 'Zona 13, Guatemala',            NULL),
('Miguel',    'Fuentes',   'miguel.f@gmail.com',        '5555-0011', 'Zona 5, Guatemala',             NULL),
('Daniela',   'Reyes',     'daniela.r@hotmail.com',     '5555-0012', 'Zona 11, Guatemala',            NULL),
('José',      'Méndez',    'jose.m@gmail.com',          '5555-0013', 'Chimaltenango, Guatemala',      NULL),
('Carmen',    'Ortiz',     'carmen.o@outlook.com',      '5555-0014', 'Zona 8, Guatemala',             NULL),
('Héctor',    'Vásquez',   'hector.v@gmail.com',        '5555-0015', 'Zona 3, Guatemala',             NULL),
('Laura',     'Pineda',    'laura.p@gmail.com',         '5555-0016', 'Quetzaltenango, Guatemala',     NULL),
('Andrés',    'Soto',      'andres.s@hotmail.com',      '5555-0017', 'Zona 12, Guatemala',            NULL),
('Patricia',  'Aguilar',   'patricia.a@gmail.com',      '5555-0018', 'Zona 1, Guatemala',             NULL),
('Rodrigo',   'Cruz',      'rodrigo.c@outlook.com',     '5555-0019', 'Zona 14, Guatemala',            NULL),
('Melissa',   'Torres',    'melissa.t@gmail.com',       '5555-0020', 'Escuintla, Guatemala',          NULL),
('Eduardo',   'Herrera',   'eduardo.h@gmail.com',       '5555-0021', 'Zona 16, Guatemala',            NULL),
('Gabriela',  'Lemus',     'gabriela.l@hotmail.com',    '5555-0022', 'Zona 4, Guatemala',             NULL),
('Francisco', 'Maldonado', 'francisco.mal@gmail.com',   '5555-0023', 'Sacatepéquez, Guatemala',       NULL),
('Natalia',   'Juárez',    'natalia.j@gmail.com',       '5555-0024', 'Zona 9, Guatemala',             NULL),
('Kevin',     'Sandoval',  'kevin.s@outlook.com',       '5555-0025', 'Zona 18, Guatemala',            NULL);

---------------------------------------------------------
-- PRODUCTOS (30)

INSERT INTO Producto (sku, nombre, marca, precio_venta, precio_costo, stock_actual, stock_minimo, descripcion, imagen_url, id_categoria, id_proveedor) VALUES
('ARD-001', 'Arduino Uno R3',              'Arduino',    85.00, 60.00, 50, 10, 'Microcontrolador ATmega328P, 14 pines digitales, 6 analogicos',          'https://placehold.co/300x300?text=ARD-001',  1, 1),
('ARD-002', 'Arduino Nano V3',             'Arduino',    65.00, 45.00, 40, 10, 'Microcontrolador compacto ATmega328P, ideal para proyectos pequenos',    'https://placehold.co/300x300?text=ARD-002',  1, 1),
('ESP-001', 'ESP32 DevKit V1',             'Espressif',  75.00, 50.00, 35,  8, 'WiFi y Bluetooth integrado, 38 pines, ideal para IoT',                   'https://placehold.co/300x300?text=ESP-001',  1, 2),
('ESP-002', 'ESP8266 NodeMCU',             'Espressif',  45.00, 30.00, 45,  8, 'Modulo WiFi economico, ideal para proyectos IoT basicos',                'https://placehold.co/300x300?text=ESP-002',  1, 2),
('SEN-001', 'Sensor DHT22 Temp/Humedad',   'Aosong',     35.00, 22.00, 30,  5, 'Sensor digital de temperatura y humedad, rango -40 a 80 grados C',      'https://placehold.co/300x300?text=SEN-001',  2, 3),
('SEN-002', 'Sensor HC-SR04 Ultrasonico',  'Generico',   18.00, 10.00, 60, 10, 'Sensor de distancia ultrasonico, rango 2cm a 400cm',                     'https://placehold.co/300x300?text=SEN-002',  2, 3),
('SEN-003', 'Sensor PIR HC-SR501',         'Generico',   15.00,  8.00, 50, 10, 'Sensor de movimiento infrarrojo pasivo, ajuste de sensibilidad',         'https://placehold.co/300x300?text=SEN-003',  2, 4),
('MOD-001', 'Modulo Bluetooth HC-05',      'Wavesen',    40.00, 25.00, 25,  5, 'Modulo Bluetooth serie, comunicacion inalambrica hasta 10m',             'https://placehold.co/300x300?text=MOD-001',  3, 4),
('MOD-002', 'Modulo OLED 0.96 I2C',        'SSD1306',    30.00, 18.00, 20,  5, 'Display OLED 128x64 pixeles, interfaz I2C, bajo consumo',                'https://placehold.co/300x300?text=MOD-002',  3, 1),
('MOD-003', 'Modulo Relay 2 Canales',      'Generico',   22.00, 12.00, 40,  8, 'Modulo rele de 2 canales 5V, control de cargas de 250VAC',               'https://placehold.co/300x300?text=MOD-003',  3, 5),
('RES-001', 'Resistencia 220 Ohms 1/4W',   'Generico',    0.50,  0.20,500, 50, 'Resistencia de carbono 220 Ohms, tolerancia 5 por ciento, Through-hole', 'https://placehold.co/300x300?text=RES-001',  4, 5),
('RES-002', 'Resistencia 10K Ohms 1/4W',   'Generico',    0.50,  0.20,500, 50, 'Resistencia de carbono 10K Ohms, tolerancia 5 por ciento, Through-hole', 'https://placehold.co/300x300?text=RES-002',  4, 5),
('RES-003', 'Resistencia 4.7K Ohms 1/2W',  'Generico',    0.75,  0.30,300, 30, 'Resistencia de carbono 4.7K Ohms, tolerancia 5 por ciento, Through-hole','https://placehold.co/300x300?text=RES-003',  4, 5),
('CAP-001', 'Capacitor Electrolitico 100uF','Generico',    1.50,  0.70,200, 20, 'Capacitor electrolitico radial 100uF 25V, vida util 2000 horas',         'https://placehold.co/300x300?text=CAP-001',  5, 2),
('CAP-002', 'Capacitor Ceramico 10nF 50V', 'Generico',    0.75,  0.30,400, 40, 'Capacitor ceramico multicapa 10nF 50V, bajo ESR',                        'https://placehold.co/300x300?text=CAP-002',  5, 2),
('LED-001', 'LED 5mm Rojo',                'Generico',    0.75,  0.30,400, 50, 'LED 5mm rojo, 2.0V, 20mA, Through-hole',                                 'https://placehold.co/300x300?text=LED-001',  6, 3),
('LED-002', 'LED 5mm Verde',               'Generico',    0.75,  0.30,400, 50, 'LED 5mm verde, 2.2V, 20mA, Through-hole',                                'https://placehold.co/300x300?text=LED-002',  6, 3),
('LED-003', 'LED 5mm Azul',                'Generico',    1.00,  0.40,300, 50, 'LED 5mm azul, 3.2V, 20mA, Through-hole',                                 'https://placehold.co/300x300?text=LED-003',  6, 3),
('HER-001', 'Soldador de Estano 30W',      'Truper',     95.00, 65.00, 15,  3, 'Soldador de punta fina 30W, temperatura fija, cable 1.5m',               'https://placehold.co/300x300?text=HER-001',  7, 1),
('HER-002', 'Multimetro Digital DT-830B',  'Prasek',    110.00, 75.00, 12,  3, 'Multimetro digital, medicion de voltaje, corriente y resistencia',       'https://placehold.co/300x300?text=HER-002',  7, 1),
('CAB-001', 'Cables Dupont Macho-Macho',   'Generico',    8.00,  4.00,100, 20, 'Set 40 cables dupont macho-macho 20cm, para protoboard',                 'https://placehold.co/300x300?text=CAB-001',  8, 4),
('CAB-002', 'Cables Dupont Macho-Hembra',  'Generico',    8.00,  4.00,100, 20, 'Set 40 cables dupont macho-hembra 20cm, para modulos',                   'https://placehold.co/300x300?text=CAB-002',  8, 4),
('FUE-001', 'Fuente Regulada 5V 2A',       'Generico',   55.00, 35.00, 20,  5, 'Fuente de poder regulada 5V 2A, conector USB, entrada 110-220V',         'https://placehold.co/300x300?text=FUE-001',  9, 2),
('FUE-002', 'Bateria Li-Po 3.7V 1000mAh',  'Generico',   45.00, 28.00, 25,  5, 'Bateria de litio polimero 3.7V 1000mAh, conector JST',                   'https://placehold.co/300x300?text=FUE-002',  9, 2),
('REL-001', 'Pulsador Momentaneo 12mm',    'Generico',    3.50,  1.50,200, 30, 'Pulsador momentaneo normalmente abierto, 12mm, 2 pines',                 'https://placehold.co/300x300?text=REL-001', 10, 5),
('POT-001', 'Potenciometro Lineal 10K',    'Generico',    5.00,  2.50,150, 20, 'Potenciometro lineal 10K Ohms, 3 terminales, montaje en PCB',            'https://placehold.co/300x300?text=POT-001', 11, 5),
('MOT-001', 'Servomotor SG90',             'Tower Pro',  28.00, 16.00, 30,  5, 'Servomotor 9g, torque 1.8kg/cm, rotacion 180 grados, senal PWM',         'https://placehold.co/300x300?text=MOT-001', 12, 3),
('MOT-002', 'Motor DC 6V 200RPM',          'Generico',   22.00, 12.00, 25,  5, 'Motor DC reductor 6V 200RPM, eje de 3mm, bajo ruido',                    'https://placehold.co/300x300?text=MOT-002', 12, 3),
('IC-001',  'NE555 Timer IC',              'Texas Ins.',  5.00,  2.50,200, 20, 'Circuito integrado temporizador NE555, DIP-8, versatil',                  'https://placehold.co/300x300?text=IC-001',  13, 4),
('IC-002',  'LM358 Op-Amp Dual',           'Texas Ins.',  6.00,  3.00,150, 20, 'Amplificador operacional dual LM358, DIP-8, 3-32V',                      'https://placehold.co/300x300?text=IC-002',  13, 4);

---------------------------------------------------------
-- VENTAS (25)

INSERT INTO Venta (fecha_venta, total, estado, id_cliente, id_empleado) VALUES
('2026-01-05 09:15:00', 183.50, 'completada',  1,  1),
('2026-01-08 10:30:00',  95.75, 'completada',  2,  2),
('2026-01-10 11:00:00',  46.25, 'completada',  3,  NULL),
('2026-01-12 14:20:00', 220.00, 'completada',  4,  1),
('2026-01-15 09:45:00',  38.50, 'completada',  5,  NULL),
('2026-01-18 16:00:00',  67.00, 'cancelada',   6,  2),
('2026-01-20 10:10:00', 155.00, 'completada',  7,  1),
('2026-01-22 13:30:00',  42.50, 'completada',  8,  NULL),
('2026-02-01 09:00:00', 310.00, 'completada',  1,  2),
('2026-02-05 11:15:00',  88.25, 'completada',  3,  NULL),
('2026-02-10 14:00:00', 125.50, 'completada',  5,  1),
('2026-02-14 10:30:00', 200.00, 'completada',  2,  NULL),
('2026-02-18 15:45:00',  56.75, 'completada',  9,  2),
('2026-03-01 09:30:00', 445.00, 'completada',  4,  1),
('2026-03-05 11:00:00',  73.25, 'completada', 10,  NULL),
('2026-03-08 10:00:00', 160.00, 'completada', 11,  2),
('2026-03-10 14:30:00',  92.00, 'completada', 12,  NULL),
('2026-03-12 09:15:00', 215.00, 'completada', 13,  1),
('2026-03-15 11:45:00',  48.75, 'completada', 14,  NULL),
('2026-03-18 13:00:00', 335.00, 'completada', 15,  2),
('2026-03-20 10:30:00',  77.50, 'cancelada',  16,  NULL),
('2026-03-22 09:00:00', 143.00, 'completada', 17,  1),
('2026-03-25 15:00:00',  29.50, 'completada', 18,  NULL),
('2026-03-28 11:30:00', 265.00, 'completada', 19,  2),
('2026-03-30 10:00:00',  88.00, 'completada', 20,  NULL);

---------------------------------------------------------
-- DETALLE DE VENTAS (40+)

INSERT INTO DetalleVenta (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES
( 1,  1,  1,  85.00,  85.00),
( 1, 16, 20,   0.75,  15.00),
( 1, 11, 50,   0.50,  25.00),
( 1, 19,  1,  58.50,  58.50),
( 2,  3,  1,  75.00,  75.00),
( 2, 21,  1,   8.00,   8.00),
( 2, 16, 10,   0.75,   7.50),
( 2, 11, 10,   0.50,   5.00),
( 3,  5,  1,  35.00,  35.00),
( 3,  6,  1,  11.25,  11.25),
( 4,  1,  2,  85.00, 170.00),
( 4,  9,  1,  30.00,  30.00),
( 4, 21,  1,   8.00,   8.00),
( 5, 27,  1,  28.00,  28.00),
( 5, 25,  3,   3.50,  10.50),
( 6,  2,  1,  65.00,  65.00),
( 7,  3,  2,  75.00, 150.00),
( 7,  8,  1,  40.00,  40.00),
( 8, 29,  4,   5.00,  20.00),
( 8, 30,  2,   6.00,  12.00),
( 8, 16, 10,   0.75,   7.50),
( 9,  1,  2,  85.00, 170.00),
( 9,  3,  1,  75.00,  75.00),
( 9, 19,  1,  65.00,  65.00),
(10,  5,  2,  35.00,  70.00),
(10,  6,  1,  18.00,  18.00),
(11, 20,  1, 110.00, 110.00),
(11, 11, 30,   0.50,  15.00),
(12,  1,  2,  85.00, 170.00),
(12,  9,  1,  30.00,  30.00),
(13, 27,  1,  28.00,  28.00),
(13, 28,  1,  22.00,  22.00),
(14,  3,  3,  75.00, 225.00),
(14,  1,  2,  85.00, 170.00),
(14,  8,  1,  40.00,  40.00),
(15, 25,  5,   3.50,  17.50),
(16,  1,  1,  85.00,  85.00),
(16,  3,  1,  75.00,  75.00),
(17, 19,  1,  95.00,  95.00),
(18,  1,  2,  85.00, 170.00),
(18,  9,  1,  30.00,  30.00),
(19, 27,  1,  28.00,  28.00),
(20,  3,  2,  75.00, 150.00),
(20, 19,  1,  95.00,  95.00),
(21, 16, 10,   0.75,   7.50),
(22,  1,  1,  85.00,  85.00),
(22, 20,  1, 110.00, 110.00),
(23, 25,  5,   3.50,  17.50),
(24,  1,  2,  85.00, 170.00),
(24,  3,  1,  75.00,  75.00),
(25,  5,  1,  35.00,  35.00),
(25, 11, 30,   0.50,  15.00),
(25, 16, 20,   0.75,  15.00);

---------------------------------------------------------
-- ORDENES DE COMPRA (25)

INSERT INTO OrdenCompra (fecha_orden, estado, id_proveedor, id_empleado) VALUES
('2026-01-03 08:00:00', 'recibida',   1,  1),
('2026-01-10 08:00:00', 'recibida',   2,  2),
('2026-01-20 08:00:00', 'recibida',   3,  1),
('2026-01-28 08:00:00', 'recibida',   4,  2),
('2026-02-05 08:00:00', 'recibida',   5,  1),
('2026-02-10 08:00:00', 'recibida',   1,  2),
('2026-02-15 08:00:00', 'recibida',   6,  1),
('2026-02-20 08:00:00', 'recibida',   7,  2),
('2026-02-25 08:00:00', 'recibida',   2,  1),
('2026-03-01 08:00:00', 'recibida',   8,  2),
('2026-03-05 08:00:00', 'recibida',   3,  1),
('2026-03-08 08:00:00', 'recibida',   9,  2),
('2026-03-10 08:00:00', 'recibida',  10,  1),
('2026-03-12 08:00:00', 'recibida',   4,  2),
('2026-03-15 08:00:00', 'recibida',  11,  1),
('2026-03-18 08:00:00', 'recibida',   5,  2),
('2026-03-20 08:00:00', 'pendiente',  1,  1),
('2026-03-22 08:00:00', 'pendiente',  2,  2),
('2026-03-24 08:00:00', 'pendiente',  3,  1),
('2026-03-26 08:00:00', 'pendiente', 12,  2),
('2026-03-27 08:00:00', 'pendiente',  6,  1),
('2026-03-28 08:00:00', 'pendiente',  7,  2),
('2026-03-29 08:00:00', 'pendiente', 13,  1),
('2026-03-30 08:00:00', 'pendiente',  4,  2),
('2026-03-31 08:00:00', 'pendiente',  8,  1);

---------------------------------------------------------
-- DETALLE DE ORDENES (30+)

INSERT INTO DetalleOrden (id_orden, id_producto, cantidad, precio_compra) VALUES
( 1,  1, 50, 60.00),
( 1,  2, 40, 45.00),
( 2,  3, 30, 50.00),
( 2,  4, 40, 30.00),
( 3,  5, 30, 22.00),
( 3,  6, 60, 10.00),
( 4,  7, 30, 16.00),
( 4,  8, 20, 25.00),
( 5, 11,500,  0.20),
( 5, 12,500,  0.20),
( 6, 13,300,  0.30),
( 6, 14,200,  0.70),
( 7, 16,400,  0.30),
( 7, 17,400,  0.30),
( 8, 18,300,  0.40),
( 8, 19, 10, 65.00),
( 9, 20, 10, 75.00),
( 9, 21,100,  4.00),
(10, 22,100,  4.00),
(10, 23, 20, 35.00),
(11, 24, 25, 28.00),
(11, 25,200,  1.50),
(12, 26,150,  2.50),
(12, 27, 20, 16.00),
(13, 28, 20, 12.00),
(13, 29,200,  2.50),
(14, 30,150,  3.00),
(15,  1, 30, 60.00),
(16,  5, 20, 22.00),
(17,  3, 20, 50.00);
