import type { WizardConfig } from "@/domain/wizard/WizardConfig";

export const LICENCIA_MEDICA_WIZARD_CONFIG: WizardConfig = {
  id: "licencia-medica-dia-pago",
  firstStep: "duracion",
  steps: {
    duracion: {
      id: "duracion",
      pregunta: "¿Cuántos días dura tu licencia autorizada?",
      opciones: [
        {
          label: "1 a 10 días (menos de 11 días)",
          next: "continuacion-corta",
        },
        {
          label: "11 días o más",
          next: "sector-largo",
        },
      ],
    },
    "continuacion-corta": {
      id: "continuacion-corta",
      pregunta:
        "¿Es una continuación de una licencia anterior (misma enfermedad, sin intervalo)?",
      opciones: [
        {
          label: "Sí, continúa una licencia anterior de la misma enfermedad",
          next: "sector-corta-continuacion",
        },
        {
          label: "No, es una licencia nueva",
          next: "sector-corta-nueva",
        },
      ],
    },
    "sector-corta-nueva": {
      id: "sector-corta-nueva",
      pregunta: "¿Eres trabajador dependiente privado o del sector público?",
      opciones: [
        {
          label: "Dependiente privado (Fonasa o Isapre)",
          resultado: {
            resultKey: "licencia-corta-privado-dia-4",
            titulo: "Pagan desde el día 4",
            descripcion:
              "Para licencias de 1 a 10 días en el sector privado, el subsidio se paga desde el día 4. Los días 1, 2 y 3 no generan subsidio. El cálculo se basa en tu promedio imponible de los últimos 3 meses.",
            pasos: [
              "Verifica que tu empleador ingresó la licencia al sistema.",
              "Espera la resolución de tu COMPIN o Isapre.",
              "Si rechazan la licencia, tienes 15 días hábiles para apelar.",
              "Si reducen los días, el pago aplica sobre los días autorizados.",
            ],
            links: [
              {
                label: "SUSESO: información sobre licencias médicas",
                href: "https://www.suseso.gob.cl/601/w3-channel.html",
              },
              {
                label: "ChileAtiende: licencia médica",
                href: "https://www.chileatiende.gob.cl/fichas/12528-licencia-medica",
              },
            ],
            nota: "Esta información es educativa. Para situaciones específicas, consulta directamente con SUSESO o la COMPIN de tu región.",
          },
        },
        {
          label: "Funcionario público o estatuto especial",
          resultado: {
            resultKey: "licencia-publico-remuneracion",
            titulo: "En el sector público se mantiene remuneración",
            descripcion:
              "Los funcionarios públicos con estatuto propio generalmente mantienen su remuneración íntegra durante la licencia médica. No aplica la regla de subsidio con días de espera del sector privado. Consulta las normas de tu institución.",
            pasos: [
              "Informa a tu empleador dentro del plazo exigido (usualmente 2 días hábiles).",
              "El departamento de RRHH tramitará la licencia.",
              "Verifica que el trámite fue ingresado al sistema.",
            ],
            links: [
              {
                label: "ChileAtiende: licencia médica",
                href: "https://www.chileatiende.gob.cl/fichas/12528-licencia-medica",
              },
            ],
            nota: "Esta información es educativa. Cada institución puede tener normas específicas.",
          },
        },
      ],
    },
    "sector-corta-continuacion": {
      id: "sector-corta-continuacion",
      pregunta: "¿Eres trabajador dependiente privado o del sector público?",
      opciones: [
        {
          label: "Dependiente privado (Fonasa o Isapre)",
          resultado: {
            resultKey: "licencia-continuacion-posible-dia-1",
            titulo:
              "Si la suma total supera 10 días, puede aplicar desde el día 1",
            descripcion:
              "Cuando una licencia continúa a otra de la misma enfermedad sin intervalo, las jornadas se suman para determinar la duración total. Si la suma supera 10 días, el subsidio de la continuación puede aplicar desde el día 1 de ese período extendido.",
            pasos: [
              "Verifica que ambas licencias tienen el mismo diagnóstico.",
              "Confirma con tu COMPIN o Isapre la suma de días y la regla de pago aplicada.",
              "Si hay discrepancia en el cálculo, apela dentro de 15 días hábiles.",
            ],
            links: [
              {
                label: "SUSESO: apelaciones de licencias",
                href: "https://www.suseso.gob.cl/601/w3-channel.html",
              },
              {
                label: "ChileAtiende: licencia médica",
                href: "https://www.chileatiende.gob.cl/fichas/12528-licencia-medica",
              },
            ],
            nota: "Esta información es educativa. La regla de continuidad tiene matices; consulta tu caso directamente con SUSESO.",
          },
        },
        {
          label: "Funcionario público o estatuto especial",
          resultado: {
            resultKey: "licencia-publico-remuneracion",
            titulo: "En el sector público se mantiene remuneración",
            descripcion:
              "Los funcionarios públicos con estatuto propio generalmente mantienen su remuneración íntegra durante la licencia médica. Consulta las normas de tu institución.",
            pasos: [
              "Informa a tu empleador dentro del plazo exigido.",
              "Tu departamento de RRHH tramitará la continuación.",
            ],
            links: [
              {
                label: "ChileAtiende: licencia médica",
                href: "https://www.chileatiende.gob.cl/fichas/12528-licencia-medica",
              },
            ],
            nota: "Esta información es educativa.",
          },
        },
      ],
    },
    "sector-largo": {
      id: "sector-largo",
      pregunta: "¿Eres trabajador dependiente privado o del sector público?",
      opciones: [
        {
          label: "Dependiente privado (Fonasa o Isapre)",
          next: "rechazada-largo",
        },
        {
          label: "Funcionario público o estatuto especial",
          resultado: {
            resultKey: "licencia-publico-remuneracion",
            titulo: "En el sector público se mantiene remuneración",
            descripcion:
              "Los funcionarios públicos con estatuto propio generalmente mantienen su remuneración íntegra durante la licencia médica. No aplica la regla de subsidio del sector privado.",
            pasos: [
              "Informa a tu empleador dentro del plazo exigido.",
              "Tu departamento de RRHH tramitará la licencia.",
            ],
            links: [
              {
                label: "ChileAtiende: licencia médica",
                href: "https://www.chileatiende.gob.cl/fichas/12528-licencia-medica",
              },
            ],
            nota: "Esta información es educativa.",
          },
        },
      ],
    },
    "rechazada-largo": {
      id: "rechazada-largo",
      pregunta: "¿La licencia fue aprobada o hay algún problema?",
      opciones: [
        {
          label: "Fue aprobada sin problemas",
          resultado: {
            resultKey: "licencia-larga-privado-dia-1",
            titulo: "Pagan desde el día 1",
            descripcion:
              "Para licencias de 11 días o más en el sector privado, el subsidio se paga desde el primer día de la licencia. El monto se calcula sobre el promedio de tus remuneraciones imponibles de los últimos 3 meses dividido en 30.",
            pasos: [
              "Verifica que tu empleador ingresó la licencia al sistema.",
              "El pago lo gestiona tu COMPIN (si es Fonasa) o tu Isapre.",
              "El plazo habitual de pago es dentro de 30 días corridos.",
            ],
            links: [
              {
                label: "SUSESO: información sobre licencias médicas",
                href: "https://www.suseso.gob.cl/601/w3-channel.html",
              },
            ],
            nota: "Esta información es educativa.",
          },
        },
        {
          label: "La rechazaron o redujeron días",
          resultado: {
            resultKey: "licencia-apelar",
            titulo: "Tienes 15 días hábiles para apelar",
            descripcion:
              "Si tu licencia fue rechazada o reducida, puedes apelar ante la COMPIN o tu Isapre dentro de 15 días hábiles desde la notificación de la resolución. Reúne los antecedentes médicos que respalden tu caso.",
            pasos: [
              "Pide la resolución de rechazo o reducción por escrito.",
              "Reúne los antecedentes médicos: historial, exámenes, informe del médico.",
              "Presenta la apelación ante la COMPIN o Isapre dentro de 15 días hábiles.",
              "Si la apelación es rechazada, puedes recurrir a SUSESO.",
            ],
            links: [
              {
                label: "SUSESO: apelaciones de licencias",
                href: "https://www.suseso.gob.cl/601/w3-channel.html",
              },
              {
                label: "ChileAtiende: reclamar licencia médica",
                href: "https://www.chileatiende.gob.cl/fichas/12528-licencia-medica",
              },
            ],
            nota: "Esta información es educativa. Para situaciones complejas, considera asistencia legal.",
          },
        },
      ],
    },
  },
};

export const FRAUDE_CARGO_NO_RECONOCIDO_WIZARD_CONFIG: WizardConfig = {
  id: "fraude-cargo-no-reconocido",
  firstStep: "tipo-producto",
  steps: {
    "tipo-producto": {
      id: "tipo-producto",
      pregunta: "¿Qué tipo de operación no reconoces?",
      opciones: [
        {
          label: "Cargo en tarjeta, compra online o suscripción no autorizada",
          next: "aviso-banco-tarjeta",
        },
        {
          label: "Transferencia electrónica no autorizada",
          next: "aviso-banco-transferencia",
        },
      ],
    },
    "aviso-banco-tarjeta": {
      id: "aviso-banco-tarjeta",
      pregunta: "¿Ya diste aviso al banco o emisor de la tarjeta?",
      opciones: [
        {
          label: "Sí, ya avisé y bloqueé la tarjeta",
          next: "tiene-folio",
        },
        {
          label: "No, todavía no he avisado",
          resultado: {
            resultKey: "fraude-avisa-banco-ahora",
            titulo: "Avisa al banco AHORA — tienes 5 días hábiles",
            descripcion:
              "La Ley 20.009 te protege si avisas dentro de 5 días hábiles desde que detectaste el cargo. Llama inmediatamente al número de emergencias de tu banco para bloquear la tarjeta y dejar constancia.",
            pasos: [
              "Llama ahora al número de emergencias de tu banco (24/7).",
              "Solicita el bloqueo de la tarjeta comprometida.",
              "Pide un número de folio o registro del aviso.",
              "Guarda captura de pantalla del cargo en tu app o cartola.",
              "Haz una denuncia en Carabineros o PDI (en línea o presencial).",
              "Presenta el reclamo formal al banco con el folio del aviso y la denuncia.",
            ],
            links: [
              {
                label: "Ley 20.009 — texto oficial (BCN)",
                href: "https://www.bcn.cl/leychile/navegar?idNorma=236736",
              },
              {
                label: "CMF: guía de protección al consumidor financiero",
                href: "https://www.cmfchile.cl/portal/principal/613/w3-article-27264.html",
              },
              {
                label: "PDI: denuncia en línea",
                href: "https://www.pdichile.cl/",
              },
            ],
            nota: "Esta información es educativa. Monedario no entrega asesoría legal. Para situaciones complejas consulta a un abogado o a SERNAC.",
          },
        },
      ],
    },
    "aviso-banco-transferencia": {
      id: "aviso-banco-transferencia",
      pregunta: "¿Ya contactaste a tu banco para reportar la transferencia?",
      opciones: [
        {
          label: "Sí, ya reporté la transferencia no autorizada",
          next: "tiene-folio",
        },
        {
          label: "No, no he contactado al banco todavía",
          resultado: {
            resultKey: "fraude-contacta-banco-inmediato",
            titulo: "Contacta al banco DE INMEDIATO",
            descripcion:
              "En transferencias no autorizadas el tiempo es crítico. Algunos bancos pueden solicitar bloqueo o recuperación si actúas dentro de pocas horas. Llama ahora.",
            pasos: [
              "Llama al número de emergencias de tu banco (24/7) ahora.",
              "Informa que hubo una transferencia no autorizada e indica el monto.",
              "Solicita bloqueo preventivo de tu cuenta si es necesario.",
              "Pide número de folio del reporte.",
              "Haz denuncia en PDI o Carabineros.",
              "Presenta reclamo formal ante el banco con los antecedentes.",
            ],
            links: [
              {
                label: "CMF: canales de reclamo",
                href: "https://www.cmfchile.cl/portal/principal/613/w3-article-27264.html",
              },
              {
                label: "SERNAC: reclamo financiero",
                href: "https://www.sernac.cl/portal/604/w3-propertyvalue-24390.html",
              },
            ],
            nota: "Esta información es educativa. Monedario no entrega asesoría legal.",
          },
        },
      ],
    },
    "tiene-folio": {
      id: "tiene-folio",
      pregunta: "¿Tienes el número de folio o registro del aviso al banco?",
      opciones: [
        {
          label: "Sí, tengo el folio del reclamo",
          next: "estado-devolucion",
        },
        {
          label: "No, no me dieron folio",
          resultado: {
            resultKey: "fraude-solicita-folio",
            titulo: "Solicita el folio por escrito",
            descripcion:
              "El banco está obligado a darte un registro de tu reclamo. Si no lo tienes, vuelve a llamar o escribe por los canales escritos (correo, sucursal) y solicita el comprobante explícitamente.",
            pasos: [
              "Contacta nuevamente al banco por escrito (email o chat oficial).",
              "Solicita el 'número de folio', 'número de caso' o 'comprobante de reclamo'.",
              "Guarda el correo o captura del chat como respaldo.",
              "Si el banco no responde en 48 horas, presenta queja ante CMF.",
            ],
            links: [
              {
                label: "CMF: formulario de denuncia",
                href: "https://www.cmfchile.cl/educa/621/w3-channel.html",
              },
            ],
            nota: "Esta información es educativa. Monedario no entrega asesoría legal.",
          },
        },
      ],
    },
    "estado-devolucion": {
      id: "estado-devolucion",
      pregunta: "¿El banco ya respondió tu reclamo?",
      opciones: [
        {
          label: "El banco aceptó devolver el dinero",
          resultado: {
            resultKey: "fraude-monitorea-deposito",
            titulo: "Bien — monitorea que el depósito se concrete",
            descripcion:
              "El banco tiene plazo para devolver. Revisa los plazos que te indicaron y guarda el comprobante de aceptación.",
            pasos: [
              "Verifica en tu aplicación el depósito en el plazo prometido.",
              "Si no llega, envía un recordatorio escrito al banco.",
              "Si supera 10 días hábiles sin depósito, presenta queja a CMF.",
            ],
            links: [
              {
                label: "CMF: seguimiento de reclamos",
                href: "https://www.cmfchile.cl/educa/621/w3-channel.html",
              },
            ],
            nota: "Esta información es educativa. Monedario no entrega asesoría legal.",
          },
        },
        {
          label: "El banco rechazó mi reclamo",
          resultado: {
            resultKey: "fraude-escala-cmf-sernac",
            titulo: "Puedes escalar a CMF y SERNAC",
            descripcion:
              "Si el banco rechaza tu reclamo y no estás de acuerdo, tienes derecho a escalar. La CMF supervisa a bancos e instituciones financieras. SERNAC puede intermediar en servicios financieros.",
            pasos: [
              "Pide al banco la respuesta del rechazo por escrito.",
              "Reúne: folio del reclamo, respuesta del banco, denuncia policial, capturas del cargo.",
              "Presenta reclamo ante CMF (formulario en línea en cmfchile.cl).",
              "También puedes presentar reclamo ante SERNAC.",
              "Si el monto es significativo, evalúa consultar un abogado.",
            ],
            links: [
              {
                label: "CMF: formulario de reclamo",
                href: "https://www.cmfchile.cl/educa/621/w3-channel.html",
              },
              {
                label: "SERNAC: reclamo financiero",
                href: "https://www.sernac.cl/portal/604/w3-propertyvalue-24390.html",
              },
            ],
            nota: "Esta información es educativa y no reemplaza asesoría legal. Para situaciones de alto monto, considera consultar a un abogado especializado en derecho del consumidor.",
          },
        },
        {
          label: "El banco todavía no responde",
          resultado: {
            resultKey: "fraude-seguimiento-plazo-legal",
            titulo: "Haz seguimiento y exige respuesta dentro del plazo legal",
            descripcion:
              "El banco tiene 20 días hábiles para responder un reclamo formal bajo la Ley 20.009. Si no responde, puedes escalar directamente a CMF.",
            pasos: [
              "Verifica cuántos días hábiles han pasado desde tu reclamo.",
              "Envía un recordatorio escrito al banco solicitando respuesta.",
              "Si superan 20 días hábiles sin respuesta, presenta queja a CMF.",
              "Guarda todos los registros de comunicación.",
            ],
            links: [
              {
                label: "CMF: formulario de reclamo",
                href: "https://www.cmfchile.cl/educa/621/w3-channel.html",
              },
            ],
            nota: "Esta información es educativa. Monedario no entrega asesoría legal.",
          },
        },
      ],
    },
  },
};
