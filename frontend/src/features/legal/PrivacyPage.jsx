import React from 'react';
import fondoImg from '../../assets/FondoLogin.png';

const PrivacyPage = () => {
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
                        Política de Privacidad <span className="text-blue-600 block sm:inline">y Datos</span>
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
                        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-100 pb-2 mb-4">
                            1. Corresponsables del Tratamiento
                        </h2>
                        <p>
                            A efectos de lo previsto en el Reglamento General de Protección de Datos (RGPD) y la LOPDGDD, 
                            se informa que los datos personales recabados a través de esta plataforma serán tratados 
                            de forma conjunta por el <strong>CIFP Virgen de Candelaria</strong> y el <strong>IES Domingo Pérez Minik</strong>, 
                            en el marco de sus competencias educativas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-100 pb-2 mb-4">
                            2. Finalidad y Base Legitimadora
                        </h2>
                        <p>
                            El tratamiento de sus datos (nombre, apellidos, correo electrónico institucional y rol asignado) 
                            tiene como única <strong>finalidad</strong> gestionar el acceso a la plataforma "Smart Economato" 
                            y permitir la simulación de los procesos de aprovisionamiento, gestión de inventario y pedidos 
                            como parte del aprendizaje académico.
                        </p>
                        <p>
                            La <strong>base legitimadora</strong> es el cumplimiento de una misión realizada en interés 
                            público en el ámbito educativo, así como el consentimiento del usuario al acceder y registrarse en el aplicativo.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-100 pb-2 mb-4">
                            3. Destinatarios y Cesiones
                        </h2>
                        <p>
                            Los datos personales no serán vendidos ni cedidos a terceros, salvo obligación legal o 
                            cuando sea estrictamente necesario para la coordinación interinstitucional del proyecto 
                            (por ejemplo, con la Consejería de Agricultura u organismos gestores de Ecocomedores del Gobierno de Canarias).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-100 pb-2 mb-4">
                            4. Derechos de los Usuarios (ARCO+)
                        </h2>
                        <p>
                            Todo usuario tiene derecho a:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-800">
                            <li><strong>Acceder</strong> a sus datos personales y conocer qué se está tratando.</li>
                            <li>Solicitar la <strong>rectificación</strong> de datos inexactos.</li>
                            <li>Solicitar su <strong>supresión</strong> cuando ya no sean necesarios para los fines educativos.</li>
                            <li>Solicitar la <strong>limitación</strong> u <strong>oposición</strong> de su tratamiento.</li>
                        </ul>
                        <p className="mt-4">
                            Puede ejercer estos derechos enviando una comunicación a la dirección de cualquiera de los centros 
                            educativos responsables.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-100 pb-2 mb-4">
                            5. Medidas de Seguridad y Cookies
                        </h2>
                        <p>
                            Se aplican las medidas técnicas y organizativas adecuadas para proteger sus datos contra accesos no autorizados. 
                        </p>
                        <p>
                            <strong>Política de Cookies:</strong> Esta plataforma utiliza <em>exclusivamente cookies técnicas de sesión</em>. 
                            Estas son estrictamente necesarias para mantener su sesión activa de forma segura (ej. tokens de autenticación) 
                            y no recaban información de rastreo publicitario, por lo que no requieren consentimiento explícito.
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

export default PrivacyPage;