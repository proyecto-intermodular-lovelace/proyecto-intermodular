import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import IngredientsSummaryPage from '../features/ingredients/IngredientsSummaryPage'
import IngredientsFullPage from '../features/ingredients/IngredientsFullPage'
import IngredientDetailPage from '../features/ingredients/IngredientDetailPage'
import ProductsImportPage from '../features/products/ProductsImportPage'
import MaterialsSummaryPage from '../features/materials/MaterialsSummaryPage'
import MaterialsFullPage from '../features/materials/MaterialsFullPage'
import MaterialDetailPage from '../features/materials/MaterialDetailPage'
import ProfilePage from '../features/profile/ProfilePage'
import SuppliersSummaryPage from '../features/suppliers/SuppliersSummaryPage'
import SuppliersFullPage from '../features/suppliers/SuppliersFullPage'
import SupplierDetailPage from '../features/suppliers/SupplierDetailPage'
import ReturnsPage from '../features/returns/ReturnsPage'
import OrdersPage from '../features/orders/OrdersPage'
import DeliveryNotesPage from '../features/delivery-notes/DeliveryNotesPage'
import CategoriesPage from '../features/categories/CategoriesPage'
import MainLayout from '../layouts/MainLayout'
import RequireAuth from '../components/RequireAuth'
import RecoverPage from '../features/auth/RecoverPage'

function AppRouter() {
    return (
        <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/recover" element={<RecoverPage />} />

            {/* Rutas protegidas */}
            <Route path="/" element={<RequireAuth><MainLayout /></RequireAuth>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />

                {/* Ingredientes */}
                <Route path="products" element={<IngredientsSummaryPage />} />
                <Route path="products/full" element={<IngredientsFullPage />} />
                <Route path="products/import" element={<ProductsImportPage />} />
                <Route path="products/new" element={<IngredientDetailPage />} />
                <Route path="products/:id" element={<IngredientDetailPage />} />

                {/* Materiales */}
                <Route path="inventory" element={<MaterialsSummaryPage />} />
                <Route path="inventory/full" element={<MaterialsFullPage />} />
                <Route path="inventory/new" element={<MaterialDetailPage />} />
                <Route path="inventory/:id" element={<MaterialDetailPage />} />

                {/* Proveedores */}
                <Route path="providers" element={<SuppliersSummaryPage />} />
                <Route path="providers/full" element={<SuppliersFullPage />} />
                <Route path="providers/new" element={<SupplierDetailPage />} />
                <Route path="providers/:id" element={<SupplierDetailPage />} />

                {/* Bajas y Devoluciones */}
                <Route path="returns" element={<ReturnsPage />} />

                {/* Pedidos */}
                <Route path="orders" element={<OrdersPage />} />

                {/* Albaranes */}
                <Route path="delivery-notes" element={<DeliveryNotesPage />} />

                {/* Categorías */}
                <Route path="categories" element={<CategoriesPage />} />

                <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default AppRouter
