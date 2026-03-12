-- Fix corrupted UTF-8 supplier names
-- Run with: docker compose exec db psql -U lovelace -d lovelace -f /scripts/fix_supplier_encoding.sql

UPDATE suppliers SET name = 'Makro España', notes = 'Mayorista general. Recogida en almacén o entrega mínimo 150 €. Cuenta cliente nº 00814.' WHERE id = 'cccccccc-0001-0000-0000-000000000001';
UPDATE suppliers SET name = 'Cárnicas Hermanos Valero', notes = 'Carnicería mayorista. Cordero, cerdo ibérico y ternera. Pedidos antes del mediodía para entrega al día siguiente.' WHERE id = 'cccccccc-0001-0000-0000-000000000004';
UPDATE suppliers SET name = 'Frigoríficos del Levante', notes = 'Aves y derivados. Certificación IFS. Entrega lunes, miércoles y viernes.' WHERE id = 'cccccccc-0001-0000-0000-000000000005';
UPDATE suppliers SET name = 'Pescados Martínez Mar', notes = 'Pescado fresco de lonja. Pedido antes de las 20h para entrega a las 5h del día siguiente.' WHERE id = 'cccccccc-0001-0000-0000-000000000006';
UPDATE suppliers SET notes = 'Pescados y mariscos ultracongelados. Temperatura garantizada -18 °C. Pedido mínimo 80 €.' WHERE id = 'cccccccc-0001-0000-0000-000000000007';
UPDATE suppliers SET name = 'Lácteos Río Segura', notes = 'Leche, nata, quesos frescos y curados. Entrega lunes y jueves. Cadena de frío garantizada.' WHERE id = 'cccccccc-0001-0000-0000-000000000008';
UPDATE suppliers SET name = 'Horno Artesano Mediterráneo', notes = 'Pan artesano, bollería y masas. Entrega diaria antes de las 7h. Mín. 20 €.' WHERE id = 'cccccccc-0001-0000-0000-000000000009';
UPDATE suppliers SET notes = 'AOVE virgen extra DOP Sierra Mágina. Bidones 5 L y 25 L. Plazo de entrega 48 h.' WHERE id = 'cccccccc-0001-0000-0000-000000000010';
UPDATE suppliers SET name = 'Bodegas Señorío de Altea', notes = 'Vinos DO Alicante. Descuento 10 % en pedidos >50 botellas. Entrega en 24 h.' WHERE id = 'cccccccc-0001-0000-0000-000000000011';
UPDATE suppliers SET notes = 'Especias, hierbas deshidratadas y salsas. Formato hostelería 1 kg / 5 L. Entrega semanal.' WHERE id = 'cccccccc-0001-0000-0000-000000000012';
UPDATE suppliers SET name = 'Suministros Hostelería Levante', notes = 'Menaje, utensilios y pequeño electrodoméstico. Catálogo en web. Entrega 48-72 h.' WHERE id = 'cccccccc-0001-0000-0000-000000000013';
UPDATE suppliers SET notes = 'Cajas, bandejas, film y bolsas para takeaway. Pedido mínimo 100 €. Entrega 24 h.' WHERE id = 'cccccccc-0001-0000-0000-000000000014';
UPDATE suppliers SET notes = 'Detergentes, desengrasantes y desinfectantes para cocina industrial. Fichas técnicas disponibles.' WHERE id = 'cccccccc-0001-0000-0000-000000000015';
UPDATE suppliers SET notes = 'Proveedor inactivo — contrato rescindido en 2025.' WHERE id = 'cccccccc-0001-0000-0000-000000000016';
