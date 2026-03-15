import React from 'react';
import fondoImg from '../../assets/FondoLogin.png';

const CopyrightPage = () => {
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
                        Aviso Legal <span className="text-blue-600 block sm:inline">y Condiciones de Uso</span>
                    </h1>
                    <button
                        onClick={() => window.close()}
                        className="px-8 py-4 text-lg bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-colors focus:ring-4 focus:ring-gray-300 outline-none"
                    >
                        Cerrar pestaña
                    </button>
                </div>

                <div className="prose lg:prose-xl max-w-none text-gray-700 leading-relaxed space-y-10">
                    
                    <section>
                        <p className="text-xl font-medium text-gray-900 border-l-4 border-blue-600 pl-4">
                            &copy; 2026 Proyecto Lovelace (Smart Economato). Todos los derechos reservados.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-100 pb-2 mb-4">
                            1. Titularidad del Aplicativo
                        </h2>
                        <p>
                            Este software es un proyecto de innovación educativa desarrollado de forma conjunta e intermodular por el 
                            <strong> CIFP Virgen de Candelaria </strong> y el <strong> IES Domingo Pérez Minik </strong>, 
                            con el respaldo del programa Ecocomedores (Gobierno de Canarias).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-100 pb-2 mb-4">
                            2. Propiedad Intelectual e Industrial
                        </h2>
                        <p>
                            Los textos, estructura, diseño, interfaces, bases de datos y código fuente utilizados en esta plataforma educativa 
                            son propiedad de los centros educativos arriba mencionados. 
                        </p>
                        <p>
                            Su distribución, reproducción, modificación o uso comercial fuera del ámbito académico para el que fue concebido 
                            está estrictamente prohibido sin la autorización expresa y por escrito de las direcciones de los centros titulares.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-100 pb-2 mb-4">
                            3. Condiciones de Uso
                        </h2>
                        <p>
                            El acceso a esta plataforma educativa atribuye la condición de Usuario (profesorado, alumnado o gestión). 
                            El Usuario se compromete a hacer un uso adecuado, lícito y diligente de los contenidos y servicios, absteniéndose de:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-800">
                            <li>Introducir datos falsos o malintencionados en las simulaciones del economato.</li>
                            <li>Intentar vulnerar las medidas de seguridad o acceder a cuentas de otros usuarios.</li>
                            <li>Realizar actividades contrarias a las normas de convivencia de los centros educativos.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-100 pb-2 mb-4">
                            4. Exención de Responsabilidad
                        </h2>
                        <p>
                            El CIFP Virgen de Candelaria y el IES Domingo Pérez Minik no se hacen responsables de los posibles daños 
                            que puedan causarse al sistema informático del usuario (hardware y software) debido al mal uso de la plataforma, 
                            caídas de la red, o uso de navegadores no actualizados. Esta es una herramienta en constante desarrollo con 
                            fines estrictamente didácticos.
                        </p>
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

export default CopyrightPage;