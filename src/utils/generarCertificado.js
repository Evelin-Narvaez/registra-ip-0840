import { jsPDF } from "jspdf";
import QRCode from "qrcode";

import logoIPNUrl from "../assets/logo-ipn.png";
import logoUPIICSAUrl from "../assets/logo-upiicsa.png";

const REGISTRADO_POR = "Evelin Francheska Narvaez Alfonso";

// ==========================================
// PALETA DE COLORES
// ==========================================

const COLORES = {
  azul: [30, 48, 62],
  dorado: [184, 137, 62],
  doradoClaro: [218, 205, 180],
  gris: [105, 112, 115],
  marfil: [250, 248, 242],
  blanco: [255, 255, 255],
  fondoFolio: [246, 243, 234],
};

// ==========================================
// CARGAR IMÁGENES
// ==========================================

function cargarImagen(url) {
  return new Promise((resolve, reject) => {
    const imagen = new Image();

    imagen.onload = () => resolve(imagen);
    imagen.onerror = () =>
      reject(new Error("No se pudo cargar un logotipo."));

    imagen.src = url;
  });
}

// ==========================================
// AGREGAR LOGOTIPO SIN DEFORMARLO
// ==========================================

function agregarLogo(doc, imagen, x, y, anchoMax, altoMax) {
  const proporcion = Math.min(
    anchoMax / imagen.naturalWidth,
    altoMax / imagen.naturalHeight
  );

  const ancho = imagen.naturalWidth * proporcion;
  const alto = imagen.naturalHeight * proporcion;

  doc.addImage(
    imagen,
    "PNG",
    x + (anchoMax - ancho) / 2,
    y + (altoMax - alto) / 2,
    ancho,
    alto
  );
}

// ==========================================
// TEXTO CON ESPACIADO EDITORIAL
// ==========================================

function textoEspaciado(doc, texto, x, y, opciones = {}) {
  const {
    fuente = "helvetica",
    estilo = "bold",
    tamano = 8,
    color = COLORES.dorado,
    espaciado = 1.2,
  } = opciones;

  doc.setFont(fuente, estilo);
  doc.setFontSize(tamano);
  doc.setTextColor(...color);
  doc.setCharSpace(espaciado);

  doc.text(texto, x, y, { align: "center" });

  doc.setCharSpace(0);
}

// ==========================================
// GENERAR CERTIFICADO PDF
// ==========================================

export async function generarCertificado(obra) {
  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const ANCHO = 297;
    const ALTO = 210;
    const CENTRO = ANCHO / 2;

    // --------------------------------------
    // CARGAR LOGOTIPOS
    // --------------------------------------

    const [logoIPN, logoUPIICSA] = await Promise.all([
      cargarImagen(logoIPNUrl),
      cargarImagen(logoUPIICSAUrl),
    ]);

    // --------------------------------------
    // FONDO DEL CERTIFICADO
    // --------------------------------------

    doc.setFillColor(...COLORES.marfil);
    doc.rect(0, 0, ANCHO, ALTO, "F");

    // --------------------------------------
    // MARCO EXTERIOR
    // --------------------------------------

    doc.setDrawColor(...COLORES.dorado);
    doc.setLineWidth(0.4);

    doc.rect(6.5, 6.5, 284, 197);

    // --------------------------------------
    // MARCO INTERIOR
    // --------------------------------------

    doc.setLineWidth(0.2);
    doc.rect(9, 9.5, 279, 191.5);

    // --------------------------------------
    // DETALLES DECORATIVOS SUPERIORES
    // --------------------------------------

    doc.setDrawColor(...COLORES.dorado);
    doc.setLineWidth(0.35);

    doc.line(12, 12.5, 21, 12.5);
    doc.line(276, 12.5, 285, 12.5);

    // --------------------------------------
    // LOGOTIPO IPN
    // --------------------------------------

    doc.setFillColor(...COLORES.blanco);
    doc.setDrawColor(...COLORES.dorado);
    doc.setLineWidth(0.3);

    doc.rect(19.5, 18, 19, 19, "FD");

    agregarLogo(
      doc,
      logoIPN,
      20.5,
      19,
      17,
      17
    );

    // --------------------------------------
    // LOGOTIPO UPIICSA
    // --------------------------------------

    doc.rect(253, 18, 19, 19, "FD");

    agregarLogo(
      doc,
      logoUPIICSA,
      254,
      19,
      17,
      17
    );

    // --------------------------------------
    // ENCABEZADO INSTITUCIONAL
    // --------------------------------------

    doc.setTextColor(...COLORES.azul);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    doc.text(
      "INSTITUTO POLITÉCNICO NACIONAL",
      CENTRO,
      24.5,
      { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORES.gris);

    doc.text(
      "UPIICSA · DISEÑO DE INTERFACES DE USUARIO",
      CENTRO,
      30,
      { align: "center" }
    );

    // --------------------------------------
    // LÍNEA DIVISORIA DEL ENCABEZADO
    // --------------------------------------

    doc.setDrawColor(...COLORES.dorado);
    doc.setLineWidth(0.4);

    doc.line(22.5, 50, 269, 50);

    // --------------------------------------
    // TEXTO SUPERIOR
    // --------------------------------------

    textoEspaciado(
      doc,
      "CONSTANCIA OFICIAL DE REGISTRO",
      CENTRO,
      60.5,
      {
        tamano: 8,
        espaciado: 1.5,
      }
    );

    // --------------------------------------
    // TÍTULO PRINCIPAL
    // --------------------------------------

    doc.setTextColor(...COLORES.azul);

    doc.setFont("times", "normal");
    doc.setFontSize(28);

    doc.text(
      "Certificado de",
      CENTRO,
      77,
      { align: "center" }
    );

    doc.setFont("times", "bold");
    doc.setFontSize(29);

    doc.text(
      "Registro de Autoría",
      CENTRO,
      90.5,
      { align: "center" }
    );

    // --------------------------------------
    // ADORNO DORADO
    // --------------------------------------

    doc.setDrawColor(...COLORES.dorado);
    doc.setLineWidth(0.35);

    doc.line(124, 95, 173, 95);

    doc.setFillColor(...COLORES.dorado);
    doc.rect(147.5, 94, 2, 2, "F");

    // --------------------------------------
    // TEXTO INTRODUCTORIO
    // --------------------------------------

    doc.setTextColor(130, 130, 130);
    doc.setFont("times", "normal");
    doc.setFontSize(11);

    doc.text(
      "Se hace constar que la obra",
      CENTRO,
      107,
      { align: "center" }
    );

    // --------------------------------------
    // TÍTULO DE LA OBRA
    // --------------------------------------

    const titulo = obra.titulo || "Obra sin título";

    doc.setTextColor(...COLORES.azul);
    doc.setFont("times", "bold");
    doc.setFontSize(19);

    // Ajustar el título para evitar desbordamientos.
    const tituloLineas = doc.splitTextToSize(titulo, 190).slice(0, 2);

    // Reducir ligeramente el tamaño si necesita dos líneas.
    if (tituloLineas.length > 1) {
      doc.setFontSize(16);
    }

    const posicionTitulo = 120;

    doc.text(
      tituloLineas,
      CENTRO,
      posicionTitulo,
      {
        align: "center",
        lineHeightFactor: 1.15,
      }
    );

    // Línea inferior del título.
    const posicionLinea =
      tituloLineas.length === 1 ? 123.5 : 131;

    doc.setDrawColor(...COLORES.doradoClaro);
    doc.setLineWidth(0.25);

    doc.line(69, posicionLinea, 227, posicionLinea);

    // --------------------------------------
    // INFORMACIÓN DEL AUTOR
    // --------------------------------------

    const posicionAutor =
      tituloLineas.length === 1 ? 133 : 139;

    textoEspaciado(
      doc,
      "REALIZADA POR",
      CENTRO,
      posicionAutor,
      {
        tamano: 7.5,
        espaciado: 1.3,
      }
    );

    // Nombre del autor.
    const autor = obra.autor || "Autor no especificado";

    doc.setTextColor(...COLORES.azul);
    doc.setFont("times", "normal");
    doc.setFontSize(16);

    const autorLineas = doc.splitTextToSize(autor, 200).slice(0, 2);

    if (autorLineas.length > 1) {
      doc.setFontSize(13);
    }

    doc.text(
      autorLineas,
      CENTRO,
      posicionAutor + 9,
      {
        align: "center",
        lineHeightFactor: 1.1,
      }
    );

    // --------------------------------------
    // FECHA DE REGISTRO
    // --------------------------------------

    const fecha = obra.fechaRegistro
      ? new Date(obra.fechaRegistro).toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "No disponible";

    const posicionFecha =
      posicionAutor + (autorLineas.length > 1 ? 20 : 17);

    doc.setTextColor(...COLORES.gris);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text(
      `Fecha de registro: ${fecha}`,
      CENTRO,
      posicionFecha,
      { align: "center" }
    );

    // --------------------------------------
    // SEPARADOR INFERIOR
    // --------------------------------------

    doc.setDrawColor(...COLORES.doradoClaro);
    doc.setLineWidth(0.3);

    doc.line(22.5, 157, 269, 157);

    // --------------------------------------
    // RECUADRO DEL FOLIO
    // --------------------------------------

    doc.setFillColor(...COLORES.fondoFolio);
    doc.setDrawColor(...COLORES.doradoClaro);
    doc.setLineWidth(0.3);

    doc.rect(27, 163, 167, 29, "FD");

    // Etiqueta del folio.
    textoEspaciado(
      doc,
      "FOLIO DE REGISTRO",
      51,
      170.5,
      {
        tamano: 7.5,
        espaciado: 1.3,
      }
    );

    // Número de folio.
    doc.setTextColor(...COLORES.azul);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);

    doc.text(
      String(obra.folio || "SIN-FOLIO"),
      34,
      181
    );

    // Persona que realizó el registro.
    doc.setTextColor(...COLORES.gris);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    doc.text(
      `Registrado por: ${REGISTRADO_POR}`,
      34,
      188.5
    );

    // --------------------------------------
    // GENERAR CÓDIGO QR REAL
    // --------------------------------------

    const qr = await QRCode.toDataURL(
      String(obra.folio || "SIN-FOLIO"),
      {
        width: 400,
        margin: 1,
        errorCorrectionLevel: "H",
        color: {
          dark: "#1E303E",
          light: "#FFFFFF",
        },
      }
    );

    // --------------------------------------
    // RECUADRO DEL CÓDIGO QR
    // --------------------------------------

    doc.setFillColor(...COLORES.blanco);
    doc.setDrawColor(...COLORES.doradoClaro);
    doc.setLineWidth(0.3);

    doc.rect(214, 161, 46, 34, "FD");

    // Imagen del QR.
    doc.addImage(
      qr,
      "PNG",
      225,
      162.5,
      24,
      24
    );

    // Texto debajo del QR.
    doc.setTextColor(...COLORES.gris);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);

    doc.text(
      "QR DE VERIFICACIÓN",
      237,
      192.5,
      { align: "center" }
    );

    // --------------------------------------
    // PIE INSTITUCIONAL
    // --------------------------------------

    doc.setDrawColor(...COLORES.dorado);
    doc.setLineWidth(0.3);

    doc.line(22.5, 198, 269, 198);

    doc.setTextColor(...COLORES.gris);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);

    doc.text(
      "UPIICSA · INSTITUTO POLITÉCNICO NACIONAL",
      CENTRO,
      203,
      { align: "center" }
    );

    // --------------------------------------
    // DETALLES DECORATIVOS INFERIORES
    // --------------------------------------

    doc.setDrawColor(...COLORES.dorado);
    doc.setLineWidth(0.35);

    doc.line(12, 199, 21, 199);
    doc.line(276, 199, 285, 199);

    // --------------------------------------
    // DESCARGAR PDF
    // --------------------------------------

    doc.save(`certificado-${obra.folio || "registro"}.pdf`);

  } catch (error) {
    console.error("Error al generar el certificado:", error);

    alert(
      "No fue posible generar el certificado. Verifica los logotipos y los datos de la obra."
    );
  }
}