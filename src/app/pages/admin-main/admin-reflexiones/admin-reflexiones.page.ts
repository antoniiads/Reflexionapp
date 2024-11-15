import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; 
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service'; 
import { Reflection } from 'src/app/models/reflection.model';
import { ToastController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-admin-reflexiones',
  templateUrl: './admin-reflexiones.page.html',
  styleUrls: ['./admin-reflexiones.page.scss'],
})
export class AdminReflexionesPage implements OnInit {

  utilsSvc = inject(UtilsService);
  productId: string;
  reflections: any[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  bookTitle: string = '';
  isAdmin: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private firebaseSvc: FirebaseService,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('productId') || '';
    
    if (!this.productId) {
      this.errorMessage = 'ID de producto no válido.';
      this.loading = false;
      return;
    }

    const userId = this.firebaseSvc.getAuth().currentUser?.uid;

    if (userId) {
      const userProfile = await this.firebaseSvc.getUserProfile(userId);
      this.isAdmin = userProfile?.role === 'admin';

      if (this.isAdmin) {
        try {
          this.reflections = await this.loadReflections(this.productId);
          if (this.reflections.length > 0) {
            this.bookTitle = await this.getBookTitle(this.reflections[0].userId, this.productId);
          }
        } catch (error) {
          console.error('Error al cargar reflexiones:', error);
          this.errorMessage = 'No se pudieron cargar las reflexiones. Intente más tarde.';
        } finally {
          this.loading = false;
        }
      } else {
        this.errorMessage = 'Acceso denegado. No eres administrador.';
        this.loading = false;
      }
    } else {
      this.errorMessage = 'Usuario no autenticado';
      this.loading = false;
    }
  }
  

  async loadReflections(productId: string) {
    const reflections = await this.firebaseSvc.getReflectionsFromAllUsers(productId);
    return Promise.all(
      reflections.map(async (reflection: Reflection) => {
        const userProfile = await this.firebaseSvc.getUserProfile(reflection.userId);
        return {
          ...reflection,
          userName: userProfile?.name || 'Nombre no disponible'
        };
      })
    );
  }

  async getBookTitle(userId: string, productId: string) {
    const product = await this.firebaseSvc.getBookById(userId, productId);
    return product?.title || 'Título no disponible';
  }

  // Función para eliminar una reflexión
async deleteReflection(userId: string, productId: string, reflectionId: string, index: number) {
  const currentUserId = this.firebaseSvc.getAuth().currentUser?.uid;

  if (currentUserId) {
    try {
      // Obtener el perfil del usuario
      const userProfile = await this.firebaseSvc.getUserProfile(currentUserId);

      // Verificar si el usuario es el propietario de la reflexión o un admin
      if (userProfile?.role === 'admin' || currentUserId === userId) {
        // Llamar al servicio para eliminar la reflexión
        await this.firebaseSvc.deleteReflection(currentUserId, productId, reflectionId);

        // Eliminar la reflexión del array local
        this.reflections.splice(index, 1);
        this.presentToast('Reflexión eliminada exitosamente.');
      } else {
        this.presentToast('No tienes permisos para eliminar esta reflexión.');
      }
    } catch (error) {
      console.error('Error al eliminar la reflexión:', error);
      this.presentToast('Error al eliminar la reflexión. Intenta nuevamente.');
    }
  } else {
    this.presentToast('Usuario no autenticado.');
  }
}

// Método para mostrar un mensaje de Toast
async presentToast(message: string) {
  const toast = await this.toastController.create({
    message: message,
    duration: 2000,
    position: 'bottom'
  });
  toast.present();
}
}