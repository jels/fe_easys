// src/app/core/services/conf/credential-print.service.ts
import { Injectable } from '@angular/core';
import { CredentialData } from './credentials.service';

@Injectable({ providedIn: 'root' })
export class CredentialPrintService {
    /**
     * Genera el HTML completo del iframe del carnet.
     * - qrDataUrl: canvas del QR convertido a base64 (se pasa desde el componente)
     * - origin: window.location.origin para construir la URL del PNG
     */
    buildIframeHtml(cd: CredentialData, qrDataUrl: string, origin: string): string {
        const initials = cd.person.fullName
            .split(' ')
            .slice(0, 2)
            .map((w: string) => w[0])
            .join('')
            .toUpperCase();

        const photoBlock = cd.person.photoUrl ? `<img src="${cd.person.photoUrl}" alt="${cd.person.fullName}" />` : `<span class="cred-initials">${initials}</span>`;

        return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Carnet</title>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  /* ── Página ─────────────────────────────────────────────────── */
  @page {
    size: 8.6cm 5.4cm;
    margin: 0;
  }

  html, body {
    width:  430px;
    height: 273px;
    background: #f0f2f5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Arial, sans-serif;
    overflow: hidden;
  }

  /* ── Carnet — mismas dimensiones que el preview ─────────────── */
  .credential-card {
    position: relative;
    width:  430px;
    height: 273px;
    border-radius: 8px;
    overflow: hidden;
    background-image: url('${origin}/assets/img/Credenciales.png');
    background-size:  100% 100%;
    background-repeat: no-repeat;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }

  /* ── Institución ─────────────────────────────────────────────── */
  .cred-institution {
    position: absolute;
    top: 0; left: 35%; right: 0.70%;
    height: 13.79%;
    display: flex; align-items: center; justify-content: flex-end;
    font-size: 12px; font-weight: 700; color: #ffffff;
    letter-spacing: 0.06em; text-transform: uppercase;
    text-align: right; white-space: nowrap; overflow: hidden;
  }

  /* ── Foto circular ───────────────────────────────────────────── */
  .cred-photo-circle {
    position: absolute;
    left: 4.98%; top: 7.56%;
    width: 28.86%; aspect-ratio: 1;
    border-radius: 50%; overflow: hidden;
    background: rgba(0,27,64,0.15);
  }
  .cred-photo-circle img {
    width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
  }
  .cred-initials {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; font-weight: 900; color: #0a4f94;
  }

  /* ── Nombre ──────────────────────────────────────────────────── */
  .cred-value-name {
    position: absolute;
    left: 0; top: 63.69%; width: 58%;
    font-size: 13px; font-weight: 800; color: #001b40;
    line-height: 1.2; text-align: center;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* ── Grado ───────────────────────────────────────────────────── */
  .cred-value-grade {
    position: absolute;
    left: 0; top: 82.07%; width: 58%;
    font-size: 10.5px; font-weight: 800; color: #001b40;
    line-height: 1.2; text-align: center;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* ── Año lectivo ─────────────────────────────────────────────── */
  .cred-value-year {
    position: absolute;
    left: 0; top: 87.50%; width: 58%;
    font-size: 10px; font-weight: 600; color: #333333;
    line-height: 1.2; text-align: center;
  }

  /* ── QR ──────────────────────────────────────────────────────── */
  .cred-qr-wrap {
    position: absolute;
    left: 60.47%; top: 37.73%;
    width: 37.21%; height: 58.61%;
    display: flex; align-items: center; justify-content: center;
    background: #ffffff;
  }
  .cred-qr-wrap img {
    display: block;
    width: 100%; height: 100%;
    image-rendering: pixelated;
  }

  /* ── Botón imprimir (solo en pantalla del iframe) ────────────── */
  .print-btn-bar {
    display: none; /* oculto — se activa desde el componente padre */
  }

  /* ── Al imprimir: ocultar todo menos el carnet ───────────────── */
  @media print {
    html, body {
      width: 8.6cm; height: 5.4cm;
      background: white;
    }
    .credential-card {
      width: 8.6cm; height: 5.4cm;
      border-radius: 0;
      box-shadow: none;
    }
    /* Fuentes escalan proporcionalmente al pasar de 430px → 8.6cm */
    .cred-institution  { font-size: 5.3px; }
    .cred-value-name   { font-size: 5.7px; }
    .cred-value-grade  { font-size: 4.6px; }
    .cred-value-year   { font-size: 4.4px; }
    .cred-initials     { font-size: 0.87rem; }
  }
</style>
</head>
<body>
  <div class="credential-card">

    <div class="cred-institution">${cd.institution}</div>

    <div class="cred-photo-circle">
      ${photoBlock}
    </div>

    <span class="cred-value-name">${cd.person.fullName}</span>
    <span class="cred-value-grade">${cd.person.displayLabel}</span>
    <span class="cred-value-year">${cd.activeYear}</span>

    <div class="cred-qr-wrap">
      <img src="${qrDataUrl}" alt="QR" />
    </div>

  </div>

  <script>
    // Exponer función de impresión al padre
    window.printCard = function() {
      window.print();
    };
  </script>
</body>
</html>`;
    }
}
