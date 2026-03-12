/**
 * Mock data for recipes
 * Based on recipe.entity.ts from backend
 * 
 * @typedef {Object} Recipe
 * @property {string} id - UUID
 * @property {string} name - Recipe name
 * @property {string} code - Recipe code
 * @property {string} description - Recipe description
 * @property {string} difficulty - Difficulty level (FACIL, MEDIA, DIFICIL)
 * @property {number} yieldQuantity - Quantity produced
 * @property {string} yieldUnit - Unit of measurement (porciones, platos, kg, L)
 * @property {number} prepTime - Preparation time in minutes
 * @property {number} cookTime - Cooking time in minutes
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Update timestamp
 */

export const mockRecipes = [
    {
        id: 'rec-001-uuid-1234',
        name: 'Pasta Carbonara',
        code: 'REC001',
        description: 'Clásica pasta italiana con salsa de huevo y bacon crujiente',
        difficulty: 'FACIL',
        yieldQuantity: 4,
        yieldUnit: 'porciones',
        prepTime: 10,
        cookTime: 15,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        allergens: [
            { id: 'alg-001', name: 'Huevo' },
            { id: 'alg-004', name: 'Gluten' }
        ],
        items: [],
    },
    {
        id: 'rec-002-uuid-5678',
        name: 'Bouillabaisse Provenzal',
        code: 'REC002',
        description: 'Sopa de pescado tradicional de Provenza con rouille y croutons',
        difficulty: 'DIFICIL',
        yieldQuantity: 6,
        yieldUnit: 'porciones',
        prepTime: 30,
        cookTime: 90,
        createdAt: '2024-01-16T14:20:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        allergens: [
            { id: 'alg-003', name: 'Mariscos' },
            { id: 'alg-004', name: 'Gluten' }
        ],
        items: [],
    },
    {
        id: 'rec-003-uuid-9012',
        name: 'Risotto alla Milanese',
        code: 'REC003',
        description: 'Arroz cremoso con azafrán, queso parmesano y caldo de pollo',
        difficulty: 'MEDIA',
        yieldQuantity: 4,
        yieldUnit: 'porciones',
        prepTime: 15,
        cookTime: 25,
        createdAt: '2024-01-17T09:45:00Z',
        updatedAt: '2024-01-17T09:45:00Z',
        allergens: [],
        items: [],
    },
    {
        id: 'rec-004-uuid-3456',
        name: 'Ceviche Peruano',
        code: 'REC004',
        description: 'Pescado crudo marinado en limón con cilantro y ají amarillo',
        difficulty: 'MEDIA',
        yieldQuantity: 6,
        yieldUnit: 'porciones',
        prepTime: 20,
        cookTime: 0,
        createdAt: '2024-01-18T11:00:00Z',
        updatedAt: '2024-01-18T11:00:00Z',
        allergens: [
            { id: 'alg-003', name: 'Mariscos' }
        ],
        items: [],
    },
    {
        id: 'rec-005-uuid-7890',
        name: 'Tacos al Pastor',
        code: 'REC005',
        description: 'Carne marinada en achiote servida en tortillas con piña y cebolla',
        difficulty: 'FACIL',
        yieldQuantity: 8,
        yieldUnit: 'tacos',
        prepTime: 25,
        cookTime: 30,
        createdAt: '2024-01-19T16:30:00Z',
        updatedAt: '2024-01-19T16:30:00Z',
        allergens: [
            { id: 'alg-004', name: 'Gluten' }
        ],
        items: [],
    },
    {
        id: 'rec-006-uuid-2345',
        name: 'Beef Wellington',
        code: 'REC006',
        description: 'Filetes de res envueltos en champiñones y hojaldre',
        difficulty: 'DIFICIL',
        yieldQuantity: 4,
        yieldUnit: 'porciones',
        prepTime: 45,
        cookTime: 40,
        createdAt: '2024-01-20T13:15:00Z',
        updatedAt: '2024-01-20T13:15:00Z',
        allergens: [
            { id: 'alg-004', name: 'Gluten' }
        ],
        items: [],
    },
    {
        id: 'rec-007-uuid-6789',
        name: 'Goulash Húngaro',
        code: 'REC007',
        description: 'Estofado de carne con paprika, cebolla y pimienta roja',
        difficulty: 'MEDIA',
        yieldQuantity: 6,
        yieldUnit: 'porciones',
        prepTime: 20,
        cookTime: 120,
        createdAt: '2024-01-21T10:00:00Z',
        updatedAt: '2024-01-21T10:00:00Z',
        allergens: [],
        items: [],
    },
    {
        id: 'rec-008-uuid-0123',
        name: 'Tarte Tatin',
        code: 'REC008',
        description: 'Tarta caramelizada de manzana con masa quebrada',
        difficulty: 'MEDIA',
        yieldQuantity: 8,
        yieldUnit: 'porciones',
        prepTime: 30,
        cookTime: 35,
        createdAt: '2024-01-22T08:30:00Z',
        updatedAt: '2024-01-22T08:30:00Z',
        allergens: [
            { id: 'alg-001', name: 'Huevo' },
            { id: 'alg-005', name: 'Frutos secos' }
        ],
        items: [],
    },
]
