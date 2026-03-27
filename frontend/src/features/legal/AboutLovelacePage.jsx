import React from 'react';
import fondoImg from '../../assets/FondoLogin.png';

const AboutLovelacePage = () => {
    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center p-4 sm:p-8"
            style={{ backgroundImage: `url(${fondoImg})` }}
        >
            <div
                className="max-w-5xl w-full mx-auto py-10 px-6 sm:px-12 max-h-[90vh] overflow-y-auto"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px' }}
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Proyecto Lovelace <span className="text-blue-600 block sm:inline">| Smart Economato</span>
                    </h1>
                    <button
                        onClick={() => window.close()}
                        className="px-8 py-4 text-lg bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-colors focus:ring-4 focus:ring-gray-300 outline-none"
                        aria-label="Cerrar pestaña de información"
                    >
                        Cerrar pestaña
                    </button>
                </div>

                <div className="prose lg:prose-xl max-w-none text-gray-700 leading-relaxed space-y-10">
                    
                    {/* Sección: Innovación y Sostenibilidad */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-100 pb-2 mb-4">
                            Innovación y Sostenibilidad en la gestión de recursos
                        </h2>
                        <p>
                            <strong>Lovelace (Smart Economato)</strong> es un proyecto educativo y social diseñado 
                            para la digitalización integral de la gestión de economatos escolares y comunitarios, 
                            orientado a la pequeña empresa del canal HORECA y los entornos educativos.
                        </p>
                        <p>
                            Nuestra plataforma promueve el consumo responsable, la trazabilidad absoluta de los productos y la economía circular, 
                            utilizando herramientas digitales para simular procesos reales de aprovisionamiento y servicio.
                        </p>
                    </section>

                    {/* Sección: Metodología */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-100 pb-2 mb-4">
                            Metodología Activa: Aprendizaje Basado en Retos (ABR)
                        </h2>
                        <p>
                            El aplicativo no solo es una herramienta de gestión, sino un entorno de aprendizaje. 
                            Involucra al alumnado de forma directa en la planificación, control y distribución de recursos alimentarios,
                             así como en el diseño del propio software.
                        </p>
                        <ul className="list-disc pl-6 space-y-3 mt-4 text-gray-800">
                            <li><strong>Trabajo colaborativo mediante Equipos Espejo:</strong> Fomento de la sinergia entre diferentes perfiles profesionales.</li>
                            <li><strong>Simulación del Mundo Laboral:</strong> Adaptación del aprendizaje a las necesidades reales del mercado.</li>
                            <li><strong>Uso intensivo de las TIC:</strong> Digitalización de flujos de trabajo tradicionales en la hostelería.</li>
                        </ul>
                    </section>

                    {/* Sección: Entorno Digital */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-100 pb-2 mb-4">
                            Entorno Digital del Smart Economato
                        </h2>
                        <p>El sistema cuenta con módulos especializados para cubrir todo el ciclo de vida del producto:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h4 className="font-bold text-blue-700 mb-2">Operaciones Diarias</h4>
                                <ul className="list-disc pl-5 space-y-2 text-base">
                                    <li>Recepción de mercancías.</li>
                                    <li>Distribución interna de productos.</li>
                                    <li>Bajas de inventario (roturas o deterioro).</li>
                                </ul>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h4 className="font-bold text-blue-700 mb-2">Control y Gestión (Herramientas)</h4>
                                <ul className="list-disc pl-5 space-y-2 text-base">
                                    <li>Inventario Permanente (Total y por Búsqueda).</li>
                                    <li>Gestión inteligente de Pedidos.</li>
                                    <li>Escandallos (Fichas técnicas y rendimientos).</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Sección: Entidades */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-100 pb-2 mb-4">
                            Entidades Coordinadoras y Colaboradoras
                        </h2>
                        <p className="mb-4">Este proyecto ha sido posible gracias a la colaboración intermodular de:</p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base font-medium text-gray-800">
                            <li className="flex items-center gap-2 bg-blue-50 p-4 rounded-lg">
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                CIFP Virgen de Candelaria
                            </li>
                            <li className="flex items-center gap-2 bg-blue-50 p-4 rounded-lg">
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                IES Domingo Pérez Minik
                            </li>
                            <li className="flex items-center gap-2 bg-blue-50 p-4 rounded-lg">
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                Gobierno de Canarias
                            </li>
                            <li className="flex items-center gap-2 bg-blue-50 p-4 rounded-lg">
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                ECOCOMEDORES (Gobierno de Canarias)
                            </li>
                        </ul>
                    </section>
                </div>

                <div className="mt-14 text-center border-t border-gray-200 pt-8">
                    <button
                        onClick={() => window.close()}
                        className="px-10 py-5 w-full sm:w-auto text-xl bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 active:bg-blue-800 transition-colors focus:ring-4 focus:ring-blue-300 outline-none"
                    >
                        Cerrar pestaña
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AboutLovelacePage;