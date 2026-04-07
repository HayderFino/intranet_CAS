const path = require("path");
const UniversalCrawler = require("../models/universalCrawler");
const NewsModel = require("../models/newsModel");
const InformeGestionModel = require("../models/informeGestionModel");
const CitaModel = require("../models/citaModel");
const SirhModel = require("../models/sirhModel");
const SnifModel = require("../models/snifModel");
const RevisionRedModel = require("../models/revisionRedModel");
const ManualFuncionesModel = require("../models/manualFuncionesModel");
const PlanMonitoreoModel = require("../models/planMonitoreoModel");
const PlanesTalentoModel = require("../models/planesTalentoModel");
const ConvocatoriasModel = require("../models/convocatoriasModel");
const EstudiosTecnicosModel = require("../models/estudiosTecnicosModel");
const ProvisionEmpleosModel = require("../models/provisionEmpleosModel");
const BoletinesModel = require("../models/boletinesModel");
const ManualesModel = require("../models/manualesModel");
const SgiModel = require("../models/sgiModel");
const PcbModel = require("../models/pcbModel");
const RespelModel = require("../models/respelModel");
const RuaModel = require("../models/ruaModel");
const AgendaModel = require("../models/agendaModel");

// ─────────────────────────────────────────────────────────────────────────────
// ÍNDICE DE PÁGINAS ESTÁTICAS
// Estas páginas NO tienen un modelo propio pero deben aparecer en búsquedas.
// Cada entrada tiene: keywords (palabras que la identifican), title, href, type, snippet.
// ─────────────────────────────────────────────────────────────────────────────
const STATIC_PAGES = [
  // ── La CAS ──
  {
    keywords: ["misión", "vision", "mision", "misión y visión"],
    title: "Misión y Visión",
    href: "/header_menu/cas/mision-vision.html",
    type: "La CAS",
    snippet:
      "Misión y visión institucional de la Corporación Autónoma Regional de Santander.",
  },
  {
    keywords: ["objetivos", "objetivo de la cas", "objetivos cas"],
    title: "Objetivos de la CAS",
    href: "/header_menu/cas/objetivos.html",
    type: "La CAS",
    snippet:
      "Objetivos institucionales de la Corporación Autónoma Regional de Santander.",
  },
  {
    keywords: ["funciones", "funciones cas", "funciones corporación"],
    title: "Funciones de la CAS",
    href: "/header_menu/cas/funciones.html",
    type: "La CAS",
    snippet: "Funciones legales y misionales de la CAS.",
  },
  {
    keywords: ["estructura", "organigrama", "estructura organizacional"],
    title: "Estructura Organizacional",
    href: "/header_menu/cas/estructura.html",
    type: "La CAS",
    snippet: "Organigrama y estructura organizacional de la CAS.",
  },
  {
    keywords: ["política ambiental", "politica ambiental", "politica"],
    title: "Política Ambiental",
    href: "/header_menu/cas/politica-ambiental.html",
    type: "La CAS",
    snippet: "Política ambiental institucional de la CAS.",
  },
  {
    keywords: ["normativa", "norma", "normativa cas", "legislación"],
    title: "Normativa CAS",
    href: "/header_menu/cas/normativa-cas.html",
    type: "La CAS",
    snippet: "Marco normativo y legislración aplicable a la CAS.",
  },
  {
    keywords: ["reseña", "historia", "resena", "acerca de"],
    title: "Reseña Histórica",
    href: "/header_menu/cas/resena.html",
    type: "La CAS",
    snippet: "Historia y reseña institucional de la CAS.",
  },
  {
    keywords: ["postalcas", "postal", "tarjeta"],
    title: "PostalCAS",
    href: "/header_menu/cas/postalcas.html",
    type: "La CAS",
    snippet: "Postales institucionales de la CAS.",
  },
  {
    keywords: ["noticias", "noticas", "noticias cas"],
    title: "NotiCAS",
    href: "/header_menu/cas/noticas-cas.html",
    type: "Noticias",
    snippet: "Noticias y comunicados institucionales de la CAS.",
  },
  {
    keywords: ["agenda", "eventos", "actividades", "calendario"],
    title: "Agenda CAS",
    href: "/header_menu/cas/agenda.html",
    type: "Agenda",
    snippet: "Agenda de eventos y actividades institucionales.",
  },
  {
    keywords: ["talento humano", "empleados", "funcionarios", "personal"],
    title: "Talento Humano CAS",
    href: "/header_menu/cas/talento-humano.html",
    type: "La CAS",
    snippet: "Gestión de talento humano, empleados y funcionarios.",
  },
  {
    keywords: ["ciberseguridad", "seguridad informática", "git ciberseguridad"],
    title: "GIT - Ciberseguridad",
    href: "/header_menu/cas/ciberseguridad.html",
    type: "GIT",
    snippet: "Recursos y lineamientos de ciberseguridad institucional.",
  },
  // ── SGI (páginas de índice) ──
  {
    keywords: ["sgi", "sistema de gestión", "calidad"],
    title: "SGI - Sistema de Gestión Integrado",
    href: "/header_menu/sgi/sgi.html",
    type: "SGI",
    snippet: "Portal del Sistema de Gestión Integrado de la CAS.",
  },
  {
    keywords: [
      "procesos estratégicos",
      "procesos estrategicos",
      "estratégicos",
    ],
    title: "Procesos Estratégicos",
    href: "/header_menu/sgi/procesos-estrategicos.html",
    type: "SGI",
    snippet: "Sección de procesos estratégicos del SGI.",
  },
  {
    keywords: ["procesos misionales", "misionales"],
    title: "Procesos Misionales",
    href: "/header_menu/sgi/procesos-misionales.html",
    type: "SGI",
    snippet: "Sección de procesos misionales del SGI.",
  },
  {
    keywords: ["procesos de apoyo", "apoyo", "procesos apoyo"],
    title: "Procesos de Apoyo",
    href: "/header_menu/sgi/procesos-apoyo.html",
    type: "SGI",
    snippet: "Sección de procesos de apoyo del SGI.",
  },
  {
    keywords: ["evaluación", "seguimiento", "proceso de evaluación"],
    title: "Proceso de Evaluación y Seguimiento",
    href: "/header_menu/sgi/evaluacion.html",
    type: "SGI",
    snippet: "Proceso de evaluación y seguimiento del SGI.",
  },
  {
    keywords: ["políticas", "politicas sgi"],
    title: "Políticas SGI",
    href: "/header_menu/sgi/politicas.html",
    type: "SGI",
    snippet: "Políticas del Sistema de Gestión Integrado.",
  },
  {
    keywords: ["objetivos de calidad", "calidad sgi"],
    title: "Objetivos de Calidad",
    href: "/header_menu/sgi/objetivos-calidad.html",
    type: "SGI",
    snippet: "Objetivos de calidad del SGI.",
  },
  {
    keywords: ["alcance sgi", "alcance del sgi", "alcance cgi"],
    title: "Alcance del SGI",
    href: "/header_menu/sgi/alcance.html",
    type: "SGI",
    snippet: "Alcance y cobertura del Sistema de Gestión Integrado.",
  },
  {
    keywords: [
      "documentos institucionales",
      "membrete",
      "papelería",
      "membrete carta",
      "membrete oficio",
      "identidad corporativa",
      "logo",
    ],
    title: "Documentos Institucionales",
    href: "/header_menu/sgi/documentos.html",
    type: "SGI",
    snippet:
      "Plantillas, membretes y documentos de identidad corporativa de la CAS.",
  },
  {
    keywords: ["manuales sgi", "manual sgi"],
    title: "Manuales SGI",
    href: "/header_menu/sgi/manuales.html",
    type: "SGI",
    snippet: "Manuales del Sistema de Gestión Integrado.",
  },
  {
    keywords: ["gestión integral", "gestion integral"],
    title: "Gestión Integral",
    href: "/header_menu/sgi/gestion-integral.html",
    type: "SGI",
    snippet: "Gestión integral ambiental y de calidad del SGI.",
  },
  {
    keywords: ["control disciplinario", "disciplinario"],
    title: "Control Disciplinario",
    href: "/header_menu/sgi/control-disciplinario.html",
    type: "SGI",
    snippet: "Proceso de control disciplinario de la CAS.",
  },
  {
    keywords: ["cobro coactivo", "coactivo", "cobro"],
    title: "Cobro Coactivo",
    href: "/header_menu/sgi/cobro-coactivo.html",
    type: "SGI",
    snippet: "Proceso de cobro coactivo de la CAS.",
  },
  {
    keywords: [
      "bienes",
      "servicios",
      "bienes y servicios",
      "contratación bienes",
    ],
    title: "Bienes y Servicios",
    href: "/header_menu/sgi/bienes-servicios.html",
    type: "SGI",
    snippet: "Gestión de bienes y servicios de la CAS.",
  },
  {
    keywords: ["contratación", "contratos", "contratacion"],
    title: "Contratación",
    href: "/header_menu/sgi/contratacion.html",
    type: "SGI",
    snippet: "Procesos de contratación y contratos institucionales.",
  },
  {
    keywords: ["jurídico", "juridico", "legal", "asuntos jurídicos"],
    title: "Jurídico",
    href: "/header_menu/sgi/juridico.html",
    type: "SGI",
    snippet: "Gestión jurídica y asuntos legales de la CAS.",
  },
  {
    keywords: [
      "gestión documental",
      "gestion documental",
      "archivo",
      "documentación",
    ],
    title: "Gestión Documental",
    href: "/header_menu/sgi/gestion-documental.html",
    type: "SGI",
    snippet: "Gestión documental y archivo institucional.",
  },
  {
    keywords: [
      "gestión financiera",
      "gestion financiera",
      "finanzas",
      "presupuesto",
    ],
    title: "Gestión Financiera",
    href: "/header_menu/sgi/gestion-financiera.html",
    type: "SGI",
    snippet: "Gestión financiera y presupuestal de la CAS.",
  },
  {
    keywords: [
      "gestión de tecnologías",
      "gestion de tecnologias",
      "tecnologías",
      "tic",
      "sistemas",
    ],
    title: "Gestión de Tecnologías",
    href: "/header_menu/sgi/gestion-tecnologias.html",
    type: "SGI",
    snippet: "Gestión de tecnologías de información y comunicación.",
  },
  {
    keywords: [
      "planeación estratégica",
      "planeacion estrategica",
      "plan estratégico",
    ],
    title: "Planeación Estratégica",
    href: "/header_menu/sgi/planeacion-estrategica.html",
    type: "SGI",
    snippet: "Planeación estratégica institucional de la CAS.",
  },
  {
    keywords: ["mejora continua", "mejora", "acciones de mejora"],
    title: "Mejora Continua",
    href: "/header_menu/sgi/mejora-continua.html",
    type: "SGI",
    snippet: "Acciones y procesos de mejora continua del SGI.",
  },
  {
    keywords: [
      "planeación ambiental",
      "planeacion ambiental",
      "ordenamiento ambiental",
    ],
    title: "Planeación Ambiental",
    href: "/header_menu/sgi/planeacion-ambiental.html",
    type: "SGI",
    snippet: "Planeación y ordenamiento ambiental del territorio.",
  },
  {
    keywords: [
      "vigilancia",
      "control ambiental",
      "seguimiento ambiental",
      "vigilancia y control",
    ],
    title: "Vigilancia, Seguimiento y Control Ambiental",
    href: "/header_menu/sgi/vigilancia-control.html",
    type: "SGI",
    snippet: "Procesos de vigilancia, seguimiento y control ambiental.",
  },
  {
    keywords: [
      "control interno",
      "auditoria",
      "auditoría",
      "control interno pci",
    ],
    title: "Control Interno",
    href: "/header_menu/sgi/control-interno.html",
    type: "SGI",
    snippet: "Proceso de control interno y auditorías institucionales.",
  },
  {
    keywords: [
      "talento humano sgi",
      "gestión del talento",
      "gestion del talento",
    ],
    title: "SGI - Talento Humano",
    href: "/header_menu/sgi/talento-humano.html",
    type: "SGI",
    snippet: "Proceso de gestión de talento humano en el SGI.",
  },
  // ── GIT ──
  {
    keywords: [
      "normatividad git",
      "normatividad tecnologías",
      "normatividad tic",
    ],
    title: "Normatividad GIT",
    href: "/header_menu/git/normatividad.html",
    type: "GIT",
    snippet: "Normatividad aplicable al Grupo de Información y Tecnología.",
  },
  {
    keywords: ["gobierno digital", "gobierno en linea", "gobierno en línea"],
    title: "Gobierno Digital",
    href: "/header_menu/git/gobierno-digital.html",
    type: "GIT",
    snippet: "Política y lineamientos de gobierno digital.",
  },
  {
    keywords: ["manuales de usuario", "manuales usuario"],
    title: "Manuales de Usuario GIT",
    href: "/header_menu/git/manuales-usuario.html",
    type: "GIT",
    snippet: "Manuales de usuario de los sistemas de información de la CAS.",
  },
  {
    keywords: ["boletines de seguridad", "boletines seguridad informatica"],
    title: "Boletines de Seguridad",
    href: "/header_menu/git/boletines.html",
    type: "GIT",
    snippet: "Boletines informativos de seguridad de la información.",
  },
  {
    keywords: [
      "responsables de la información",
      "responsables pagina web",
      "responsables web",
    ],
    title: "Responsables de la Información en Página WEB",
    href: "/header_menu/git/responsables.html",
    type: "GIT",
    snippet:
      "Responsables de la actualización de información en la página web.",
  },
  {
    keywords: [
      "protección de datos",
      "proteccion de datos",
      "datos personales",
      "habeas data",
    ],
    title: "Protección de Datos Personales",
    href: "/header_menu/git/proteccion-datos.html",
    type: "GIT",
    snippet: "Política de protección de datos personales de la CAS.",
  },
  {
    keywords: ["cita", "manual cita", "sistema cita"],
    title: "Manual de Usuario - CITA",
    href: "/header_menu/git/manuales_usuario/cita.html",
    type: "Manual Usuario",
    snippet: "Manual de usuario del sistema CITA.",
  },
  {
    keywords: ["sirh", "manual sirh", "sistema sirh", "nómina"],
    title: "Manual de Usuario - SIRH",
    href: "/header_menu/git/manuales_usuario/sirh.html",
    type: "Manual Usuario",
    snippet:
      "Manual de usuario del Sistema de Información de Recursos Humanos.",
  },
  {
    keywords: ["snif", "manual snif", "sistema snif"],
    title: "Manual de Usuario - SNIF",
    href: "/header_menu/git/manuales_usuario/snif.html",
    type: "Manual Usuario",
    snippet: "Manual de usuario del Sistema Nacional de Información Forestal.",
  },
  {
    keywords: [
      "revisión de red",
      "revision de red",
      "red primer nivel",
      "redes sedes",
    ],
    title: "Manual - Revisión de Red Primer Nivel",
    href: "/header_menu/git/manuales_usuario/revision-red.html",
    type: "Manual Usuario",
    snippet: "Manual para revisión de red en sedes regionales de apoyo.",
  },
  // ── Herramientas ──
  {
    keywords: ["respel", "residuos peligrosos", "residuos especiales"],
    title: "RESPEL",
    href: "/herramientas/respel.html",
    type: "Herramienta",
    snippet: "Registro y control de residuos peligrosos.",
  },
  {
    keywords: ["rua", "registro único ambiental"],
    title: "RUA - Registro Único Ambiental",
    href: "/herramientas/rua.html",
    type: "Herramienta",
    snippet: "Registro Único Ambiental – formulario de reporte RUA.",
  },
  {
    keywords: ["pcb", "bifenilos policlorados"],
    title: "PCB - Bifenilos Policlorados",
    href: "/herramientas/pcb.html",
    type: "Herramienta",
    snippet: "Registro y control de bifenilos policlorados (PCB).",
  },
  {
    keywords: [
      "cartografía",
      "cartografia",
      "mapa",
      "sig",
      "gis",
      "visor geográfico",
    ],
    title: "Cartografía en Línea",
    href: "/herramientas/cartografia.html",
    type: "Herramienta",
    snippet: "Visor cartográfico y sistemas de información geográfica.",
  },
  {
    keywords: ["soporte", "soporte técnico", "mesa de ayuda", "helpdesk"],
    title: "Soporte Técnico",
    href: "/herramientas/soporte.html",
    type: "Herramienta",
    snippet: "Mesa de ayuda y soporte técnico para funcionarios.",
  },
  {
    keywords: ["galería", "galeria", "fotos", "imágenes", "imagenes"],
    title: "Galería",
    href: "/herramientas/galeria.html",
    type: "Herramienta",
    snippet: "Galería fotográfica e imágenes institucionales.",
  },
  {
    keywords: ["correo", "correo electrónico", "email", "outlook", "webmail"],
    title: "Correo Electrónico",
    href: "/herramientas/correo.html",
    type: "Herramienta",
    snippet: "Acceso al correo electrónico institucional.",
  },
  {
    keywords: ["calendario", "agenda", "eventos", "reuniones"],
    title: "Calendario",
    href: "/herramientas/calendario.html",
    type: "Herramienta",
    snippet: "Calendario de eventos y reuniones institucionales.",
  },
  // ── Talento Humano CAS ──
  {
    keywords: [
      "manual de funciones",
      "manual funciones",
      "funciones y competencias",
      "cargos",
    ],
    title: "Manual de Funciones y Competencias",
    href: "/header_menu/cas/manual-funciones.html",
    type: "Talento Humano",
    snippet: "Manual de funciones y competencias laborales de la CAS.",
  },
  {
    keywords: [
      "plan de monitoreo sigep",
      "plan monitoreo",
      "sigep",
      "monitoreo sigep",
    ],
    title: "Plan de Monitoreo del SIGEP",
    href: "/header_menu/cas/plan-monitoreo-sigep.html",
    type: "Talento Humano",
    snippet: "Plan de monitoreo y seguimiento del SIGEP.",
  },
  {
    keywords: ["planes", "planes de bienestar", "planes laborales"],
    title: "Planes de Talento Humano",
    href: "/header_menu/cas/planes.html",
    type: "Talento Humano",
    snippet: "Planes institucionales de talento humano y bienestar.",
  },
  {
    keywords: ["convocatorias", "concurso", "concurso de méritos"],
    title: "Convocatorias",
    href: "/header_menu/cas/convocatorias.html",
    type: "Talento Humano",
    snippet: "Convocatorias y concursos de méritos para ingreso a la CAS.",
  },
  {
    keywords: ["estudios técnicos", "estudios tecnicos", "estudio técnico"],
    title: "Estudios Técnicos",
    href: "/header_menu/cas/estudios-tecnicos.html",
    type: "Talento Humano",
    snippet: "Estudios técnicos de actualización y equivalencia salarial.",
  },
  {
    keywords: [
      "provisión de empleos",
      "provision de empleos",
      "provisión empleo",
      "provisión",
    ],
    title: "Provisión de Empleos de Carrera",
    href: "/header_menu/cas/provision-empleos.html",
    type: "Talento Humano",
    snippet: "Procesos de provisión de empleos de carrera administrativa.",
  },
  {
    keywords: [
      "desprendibles de nómina",
      "desprendibles nomina",
      "nómina",
      "nomina",
    ],
    title: "Desprendibles de Nómina",
    href: "https://cas.delfineco.com/gdpagos_cas/",
    type: "Talento Humano",
    snippet: "Acceso a desprendibles de nómina en línea.",
  },
  // ── MECI ──
  {
    keywords: [
      "meci",
      "modelo estándar de control",
      "modelo de control interno",
    ],
    title: "MECI - Modelo Estándar de Control Interno",
    href: "/meci.html",
    type: "MECI",
    snippet: "Modelo Estándar de Control Interno de la CAS.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Función de coincidencia flexible (OR para páginas estáticas, AND
// para búsqueda general de texto libre)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Para un texto libre: divide en palabras y exige que TODAS coincidan (AND).
 */
function matchesAll(text, keywords) {
  if (!text || keywords.length === 0) return false;
  const lower = text.toLowerCase();
  return keywords.every((k) => lower.includes(k));
}

/**
 * Para páginas estáticas: al menos UNA keyword del índice debe estar en la query (OR).
 */
function matchesStatic(query, pageKeywords) {
  if (!query) return false;
  const lq = query.toLowerCase();
  return pageKeywords.some(
    (kw) => lq.includes(kw.toLowerCase()) || kw.toLowerCase().includes(lq),
  );
}

const SearchController = {
  search: async (req, res) => {
    try {
      const { q, category, startDate, endDate } = req.query;
      const query = (q || "").trim().toLowerCase();
      const keywords = query.split(/\s+/).filter((k) => k.length > 0);
      const results = [];

      // ── 1. NOTICIAS (MongoDB) ──────────────────────────────────────
      if (!category || category === "all" || category === "noticias") {
        try {
          const news = await NewsModel.getAll();
          news.forEach((item) => {
            const text = `${item.title} ${item.description}`;
            if (matchesAll(text, keywords)) {
              results.push({
                title: item.title,
                type: "Noticia",
                href: "/header_menu/cas/noticas-cas.html",
                date: item.createdAt
                  ? new Date(item.createdAt).toISOString().split("T")[0]
                  : null,
                snippet: (item.description || "").substring(0, 150) + "...",
              });
            }
          });
        } catch (e) {
          console.error("Search error (News):", e.message);
        }
      }

      // ── 2. INFORMES DE GESTIÓN ────────────────────────────────────
      if (!category || category === "all" || category === "informes") {
        try {
          InformeGestionModel.getAll().forEach((item) => {
            const text = `${item.title} ${item.description || ""}`;
            if (matchesAll(text, keywords)) {
              results.push({
                title: item.title,
                type: "Informe de Gestión",
                href: "/header_menu/cas/informe-gestion.html",
                date: null,
                snippet: (item.description || "").substring(0, 150),
              });
            }
          });
        } catch (e) {
          console.error("Search error (Informes):", e.message);
        }
      }

      // ── 3. MODELOS ESTRUCTURADOS CON ARCHIVOS ────────────────────
      if (!category || category === "all" || category === "manuales") {
        const manualModels = [
          {
            model: CitaModel,
            type: "Manual CITA",
            href: "/header_menu/git/manuales_usuario/cita.html",
          },
          {
            model: SirhModel,
            type: "Manual SIRH",
            href: "/header_menu/git/manuales_usuario/sirh.html",
          },
          {
            model: SnifModel,
            type: "Manual SNIF",
            href: "/header_menu/git/manuales_usuario/snif.html",
          },
          {
            model: RevisionRedModel,
            type: "Revisión de Red",
            href: "/header_menu/git/manuales_usuario/revision-red.html",
          },
          {
            model: ManualFuncionesModel,
            type: "Manual de Funciones",
            href: "/header_menu/cas/manual-funciones.html",
          },
          {
            model: PlanMonitoreoModel,
            type: "Plan Monitoreo SIGEP",
            href: "/header_menu/cas/plan-monitoreo-sigep.html",
          },
          {
            model: PlanesTalentoModel,
            type: "Planes Talento Humano",
            href: "/header_menu/cas/planes.html",
          },
          {
            model: ConvocatoriasModel,
            type: "Convocatoria",
            href: "/header_menu/cas/convocatorias.html",
          },
          {
            model: EstudiosTecnicosModel,
            type: "Estudios Técnicos",
            href: "/header_menu/cas/estudios-tecnicos.html",
          },
          {
            model: ProvisionEmpleosModel,
            type: "Provisión de Empleos",
            href: "/header_menu/cas/provision-empleos.html",
          },
          {
            model: BoletinesModel,
            type: "Boletín de Seguridad",
            href: "/header_menu/git/boletines.html",
          },
          {
            model: ManualesModel,
            type: "Manual SGI",
            href: "/header_menu/sgi/manuales.html",
          },
          { model: PcbModel, type: "PCB", href: "/herramientas/pcb.html" },
          {
            model: RespelModel,
            type: "RESPEL",
            href: "/herramientas/respel.html",
          },
          { model: RuaModel, type: "RUA", href: "/herramientas/rua.html" },
        ];

        for (const mObj of manualModels) {
          try {
            mObj.model.getAll().forEach((item) => {
              const name = item.name || item.title || "";
              const desc =
                item.description ||
                item.subtitle ||
                item.category ||
                item.code ||
                "";
              const fileUrl = item.href || item.fileUrl || mObj.href;
              const text = `${name} ${desc} ${fileUrl}`;
              if (matchesAll(text, keywords)) {
                results.push({
                  title: name,
                  type: mObj.type,
                  href: fileUrl || mObj.href,
                  date: item.date || null,
                  snippet: desc || name,
                });
              }
            });
          } catch (e) {
            console.error(`Search error (${mObj.type}):`, e.message);
          }
        }

        // ── 4. SGI (TODAS LAS SECCIONES) ─────────────────────────
        try {
          SgiModel.getAllSections().forEach((item) => {
            const text = `${item.name} ${item.category} ${item.fileUrl} ${item.sectionLabel}`;
            if (matchesAll(text, keywords)) {
              results.push({
                title: item.name,
                type: item.sectionLabel,
                href: item.fileUrl || "#",
                date: null,
                snippet: `Categoría: ${item.category} — ${item.sectionLabel}`,
              });
            }
          });
        } catch (e) {
          console.error("Search error (SGI All):", e.message);
        }

        // ── 5. AGENDA ─────────────────────────────────────────────
        try {
          AgendaModel.getAll().forEach((item) => {
            const text = `${item.title} ${item.description}`;
            if (matchesAll(text, keywords)) {
              results.push({
                title: item.title,
                type: "Agenda",
                href: "/header_menu/cas/agenda.html",
                date: item.date || null,
                snippet: item.description,
              });
            }
          });
        } catch (e) {
          console.error("Search error (Agenda):", e.message);
        }

        // ── 6. CRAWLER UNIVERSAL (TODOS los HTML + archivos físicos) ──
        try {
          const crawlerResults = UniversalCrawler.search(query);
          const seenHrefs = new Set(results.map((r) => r.href));
          crawlerResults.forEach((item) => {
            if (!seenHrefs.has(item.href)) {
              seenHrefs.add(item.href);
              results.push({
                title: item.title,
                type: item.type,
                href: item.href,
                date: null,
                snippet: item.snippet || item.category || item.type,
              });
            }
          });
        } catch (e) {
          console.error("Search error (UniversalCrawler):", e.message);
        }
      }

      // ── 7. PÁGINAS ESTÁTICAS (índice de navegación kw) ────────────
      if (keywords.length > 0) {
        STATIC_PAGES.forEach((page) => {
          if (matchesStatic(query, page.keywords)) {
            const alreadyIn = results.some(
              (r) => r.href === page.href && r.title === page.title,
            );
            if (!alreadyIn) {
              results.push({
                title: page.title,
                type: page.type,
                href: page.href,
                date: null,
                snippet: page.snippet,
              });
            }
          }
        });
      }

      // ── 7. FILTRADO POR FECHA ─────────────────────────────────────
      let filteredResults = results;
      if (startDate) {
        const start = new Date(startDate);
        filteredResults = filteredResults.filter(
          (r) => new Date(r.date) >= start,
        );
      }
      if (endDate) {
        const end = new Date(endDate);
        filteredResults = filteredResults.filter(
          (r) => new Date(r.date) <= end,
        );
      }

      // Ordenar: primero los que tienen fecha real, luego el resto
      filteredResults.sort((a, b) => {
        if (a.date === null && b.date !== null) return 1;
        if (b.date === null && a.date !== null) return -1;
        return new Date(b.date) - new Date(a.date);
      });

      res.json(filteredResults);
    } catch (error) {
      console.error("Global search error:", error);
      res.status(500).json({ message: "Error interno en el buscador" });
    }
  },
};

module.exports = SearchController;
