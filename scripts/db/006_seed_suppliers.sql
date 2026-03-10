-- ============================================================
-- 006_seed_suppliers.sql  –  Proveedores de prueba
-- Proveedores realistas para hostelería / CIFP Lovelace
-- Idempotente: ON CONFLICT DO NOTHING
-- ============================================================

BEGIN;

INSERT INTO public.suppliers (id, name, contact_email, phone, notes, is_active)
VALUES
  -- Mayoristas de alimentación
  (
    'cccccccc-0001-0000-0000-000000000001',
    'Makro España',
    'pedidos@makro.es',
    '900 130 130',
    'Mayorista general. Recogida en almacén o entrega mínimo 150 €. Cuenta cliente nº 00814.',
    true
  ),
  (
    'cccccccc-0001-0000-0000-000000000002',
    'Metro Cash & Carry',
    'clientes@metro.es',
    '900 200 300',
    'Oferta semanal en frescos. Entrega martes y jueves antes de las 8h.',
    true
  ),
  (
    'cccccccc-0001-0000-0000-000000000003',
    'Disfruta Distribuciones',
    'pedidos@disfruta.es',
    '966 421 100',
    'Especialistas en frutas y verduras locales. Pedido mínimo 50 €. Entrega diaria 6-9h.',
    true
  ),

  -- Cárnicos
  (
    'cccccccc-0001-0000-0000-000000000004',
    'Cárnicas Hermanos Valero',
    'ventas@carnicasvalero.com',
    '965 550 270',
    'Carnicería mayorista. Cordero, cerdo ibérico y ternera. Pedidos antes del mediodía para entrega al día siguiente.',
    true
  ),
  (
    'cccccccc-0001-0000-0000-000000000005',
    'Frigoríficos del Levante',
    'comercial@frigolevante.es',
    '961 880 045',
    'Aves y derivados. Certificación IFS. Entrega lunes, miércoles y viernes.',
    true
  ),

  -- Pescadería
  (
    'cccccccc-0001-0000-0000-000000000006',
    'Pescados Martínez Mar',
    'pedidos@martinezmar.com',
    '965 203 710',
    'Pescado fresco de lonja. Pedido antes de las 20h para entrega a las 5h del día siguiente.',
    true
  ),
  (
    'cccccccc-0001-0000-0000-000000000007',
    'Ultracongelados Aquafrost',
    'ventas@aquafrost.es',
    '902 445 567',
    'Pescados y mariscos ultracongelados. Temperatura garantizada -18 °C. Pedido mínimo 80 €.',
    true
  ),

  -- Lácteos y panadería
  (
    'cccccccc-0001-0000-0000-000000000008',
    'Lácteos Río Segura',
    'info@lacteosriosegura.es',
    '968 341 200',
    'Leche, nata, quesos frescos y curados. Entrega lunes y jueves. Cadena de frío garantizada.',
    true
  ),
  (
    'cccccccc-0001-0000-0000-000000000009',
    'Horno Artesano Mediterráneo',
    'pedidos@hornomediterraneo.com',
    '966 788 910',
    'Pan artesano, bollería y masas. Entrega diaria antes de las 7h. Mín. 20 €.',
    true
  ),

  -- Vinos, aceites y especias
  (
    'cccccccc-0001-0000-0000-000000000010',
    'Aceites y Olivas del Sur',
    'export@aceitesdelsur.com',
    '953 101 555',
    'AOVE virgen extra DOP Sierra Mágina. Bidones 5 L y 25 L. Plazo de entrega 48 h.',
    true
  ),
  (
    'cccccccc-0001-0000-0000-000000000011',
    'Bodegas Señorío de Altea',
    'comercial@senoriodealtea.es',
    '965 840 300',
    'Vinos DO Alicante. Descuento 10 % en pedidos >50 botellas. Entrega en 24 h.',
    true
  ),
  (
    'cccccccc-0001-0000-0000-000000000012',
    'Condimentos e Industrias Romero',
    'ventas@condimentosromero.es',
    '968 220 190',
    'Especias, hierbas deshidratadas y salsas. Formato hostelería 1 kg / 5 L. Entrega semanal.',
    true
  ),

  -- Material de cocina y packaging
  (
    'cccccccc-0001-0000-0000-000000000013',
    'Suministros Hostelería Levante',
    'pedidos@shlevante.com',
    '961 930 444',
    'Menaje, utensilios y pequeño electrodoméstico. Catálogo en web. Entrega 48-72 h.',
    true
  ),
  (
    'cccccccc-0001-0000-0000-000000000014',
    'Envases y Packaging Costa Blanca',
    'comercial@packagingcb.es',
    '965 671 830',
    'Cajas, bandejas, film y bolsas para takeaway. Pedido mínimo 100 €. Entrega 24 h.',
    true
  ),

  -- Limpieza y seguridad alimentaria
  (
    'cccccccc-0001-0000-0000-000000000015',
    'Quimicalia Higiene Profesional',
    'higiene@quimicalia.es',
    '902 100 620',
    'Detergentes, desengrasantes y desinfectantes para cocina industrial. Fichas técnicas disponibles.',
    true
  ),

  -- Proveedor desactivado (para pruebas de filtrado)
  (
    'cccccccc-0001-0000-0000-000000000016',
    'Distribuidora Antigua S.L.',
    NULL,
    NULL,
    'Proveedor inactivo — contrato rescindido en 2025.',
    false
  )

ON CONFLICT (name) DO NOTHING;

COMMIT;
