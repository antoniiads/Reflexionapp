import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-reflection-modal',
  template: `
<ion-content>
  <div class="reflection-container">
    <p class="reflection-label">Ingrese su reflexión aquí...</p>
    
    <ion-item lines="none">
      <ion-textarea
        placeholder="Escribe tu reflexión aquí..."
        [(ngModel)]="reflectionText"
        autoGrow="true"
      ></ion-textarea>
    </ion-item>

    <ion-button expand="block" (click)="submitReflection()" class="save-button">Subir Reflexión</ion-button>
  </div>
</ion-content>

  `,
  styleUrls: ['./reflection-modal.component.scss']
})
export class ReflectionModalComponent {
  @Input() productId: string;
  reflectionText: string = '';

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  submitReflection() {
    this.modalController.dismiss(this.reflectionText);
  }
}
