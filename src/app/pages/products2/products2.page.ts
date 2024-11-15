import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Router } from '@angular/router';
import { AlertController, ModalController, NavController, ToastController } from '@ionic/angular'; // Importa AlertController

@Component({
  selector: 'app-products2',
  templateUrl: './products2.page.html',
  styleUrls: ['./products2.page.scss'],
})
export class Products2Page implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  searchText: string = '';
  loading: boolean = true;
  selectedCategory: string = '';
  categories: string[] = ['Romance/Drama', 'Ciencia/Ficcion', 'Misterio/Thriller', 'Poesia', 'Fantasia', 'Historia'];
  showSearchBar: boolean = false;
  showCategoryFilter: boolean = false; // Variable para controlar la visibilidad del filtro de categorías

  constructor(
    private firebaseSvc: FirebaseService, 
    private router: Router,
    private alertController: AlertController, // Inyecta AlertController
    private modalController: ModalController,
    private navCtrl: NavController,
    private toastController: ToastController,

  ) {}

  async ngOnInit() {
    this.loading = true;
    try {
      this.products = await this.firebaseSvc.getAllProducts();
      this.filteredProducts = this.products;
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      this.loading = false;
    }
  }
  toggleSearchBar() {
    this.showSearchBar = !this.showSearchBar;
    if (!this.showSearchBar) {
      this.searchText = '';
      this.filterProducts();
    }
  }

  toggleCategoryFilter() {
    this.showCategoryFilter = !this.showCategoryFilter; // Cambia el estado del filtro de categorías
    if (!this.showCategoryFilter) {
      this.selectedCategory = ''; // Limpia la selección de categoría cuando se oculta
      this.filterProducts(); // Actualiza la lista de productos
    }
  }
  filterProducts() {
    let filtered = this.products;
    
    if (this.selectedCategory) {
      filtered = filtered.filter(product => product.categoria === this.selectedCategory);
    }

    if (this.searchText.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    this.filteredProducts = filtered;
  }

  clearFilter() {
    this.selectedCategory = '';
    this.filterProducts();
  }

  searchProducts() {
    this.filterProducts();
  }

  

  async verReflexiones() {
    // Crear y mostrar una alerta inspiradora con opciones de registro e inicio de sesión
    const alert = await this.alertController.create({
      header: 'Inspiración Diaria',
      message: 'Descubre reflexiones inspiradoras que enriquecerán tu vida. Para acceder, regístrate o inicia sesión.',
      buttons: [
        {
          text: 'Registrarse',
          handler: () => {
            this.router.navigate(['/auth/sign-up']); // Redirige a la página de registro
          }
        },
        {
          text: 'Iniciar Sesión',
          handler: () => {
            this.router.navigate(['/auth']); // Redirige a la página de inicio de sesión
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }
}
