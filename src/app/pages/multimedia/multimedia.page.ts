
import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import {
  Camera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';
import {
  BarcodeScanner,
  BarcodeFormat
} from '@capacitor-mlkit/barcode-scanning';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton
} from '@ionic/angular';

@Component({
  selector: 'app-multimedia',
  templateUrl: './multimedia.page.html',
  styleUrls: ['./multimedia.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton
  ]
})
export class MultimediaPage {
  
constructor(
  private zone: NgZone,
  private cdr: ChangeDetectorRef
) {
  console.log('MULTIMEDIA: página creada');
}

  resultadoQR = '';
  mensajeQR = '';
  escaneando = false;
  fotoUrl = '';
  mensajeCamara = '';

  async escanearQR() {
    console.log('PRUEBA QR: se pulsó el botón');
    if (!Capacitor.isNativePlatform()) {
      this.mensajeQR =
        'El escáner QR está disponible en la aplicación móvil.';
      return;
    }

    if (this.escaneando) {
      return;
    }

    this.escaneando = true;
    this.resultadoQR = '';
    this.mensajeQR = '';

    try {
      const soporte = await BarcodeScanner.isSupported();

      if (!soporte.supported) {
        this.mensajeQR =
          'Este dispositivo no admite el escaneo de códigos.';
        return;
      }

      const modulo =
  await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();

if (!modulo.available) {
  this.mensajeQR =
    'Descargando el módulo del escáner QR. Espera, por favor.';

  try {
    const listener = await BarcodeScanner.addListener(
      'googleBarcodeScannerModuleInstallProgress',
      async (evento) => {
        console.log('Progreso de instalación QR:', evento);

        const comprobacion =
          await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();

        if (comprobacion.available) {
          await listener.remove();
          this.mensajeQR =
            'Módulo instalado. Pulsa Escanear código QR nuevamente.';
          this.escaneando = false;
        }
      }
    );

    await BarcodeScanner.installGoogleBarcodeScannerModule();
  } catch (error) {
    console.error('Error instalando módulo QR:', error);
    this.mensajeQR =
      'No se pudo instalar el módulo QR. Comprueba tu conexión a Internet.';
    this.escaneando = false;
  }

  return;
}

      const permiso = await BarcodeScanner.requestPermissions();

      if (permiso.camera !== 'granted') {
        this.mensajeQR =
          'Necesitas conceder permiso para utilizar la cámara.';
        return;
      }

            const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode]
      });

      console.log('QR: escaneo terminado');
      console.log('QR: resultado recibido', barcodes);

      this.zone.run(() => {
        if (barcodes.length > 0) {
          this.resultadoQR = barcodes[0].rawValue || '';
          this.mensajeQR = this.resultadoQR
            ? 'Código QR leído correctamente.'
            : 'No se encontró contenido legible en el código.';
        } else {
          this.mensajeQR = 'No se detectó ningún código QR.';
        }
      });

      console.log('QR: pantalla actualizada');
    } catch (error) {
      console.error('Error al escanear QR:', error);
      this.zone.run(() => {
        this.mensajeQR =
          'No se pudo completar el escaneo. Inténtalo nuevamente.';
      });
    } finally {
      console.log('QR: entrando en finally');

      this.zone.run(() => {
  this.escaneando = false;
  this.cdr.detectChanges();
  console.log('QR: escaneando restablecido', this.escaneando);
});
    }
  }

  async tomarFoto() {
  try {
    const foto = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });

    this.fotoUrl = foto.webPath || '';
    this.mensajeCamara = this.fotoUrl
      ? 'Fotografía capturada correctamente.'
      : 'No se obtuvo ninguna fotografía.';

  } catch (error) {
    console.error('Error al tomar la fotografía:', error);
    this.mensajeCamara =
      'No se pudo tomar la fotografía. Inténtalo nuevamente.';
  }
}
}
