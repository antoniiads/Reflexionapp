import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service'; // Ajusta la ruta si es necesario
import { ModalController } from '@ionic/angular';
import { ReflectionModalComponent } from 'src/app/shared/components/reflection-modal/reflection-modal.component'; // Ajusta la ruta si es necesario
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.page.html',
  styleUrls: ['./admin-products.page.scss']
})
export class AdminProductsPage implements OnInit {
  products: any[] = [];              // Todos los productos obtenidos de Firebase
  filteredProducts: any[] = [];      // Productos filtrados por búsqueda o categoría
  searchText: string = '';           // Texto para la búsqueda
  selectedCategory: string = '';     // Categoría seleccionada para el filtro
  showSearchBar: boolean = false;    // Muestra u oculta la barra de búsqueda
  showCategoryFilter: boolean = false; // Muestra u oculta el filtro de categoría
  loading: boolean = true;           // Indicador de carga
  showReflections: boolean[] = [];   // Controla la visibilidad de las reflexiones por producto

  constructor(
    private firebaseSvc: FirebaseService,
    private modalCtrl: ModalController,
    private navCtrl: NavController

  ) {}

  ngOnInit() {
    // Cargar los productos al iniciar la página
    this.loadProducts();
  }

  // Método para cargar los productos desde Firebase
  async loadProducts() {
    try {
      const productsData = await this.firebaseSvc.getAllProducts();
      this.products = productsData;
      this.filteredProducts = [...this.products];
      this.loading = false;
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.loading = false;
    }
  }
  

  // Muestra u oculta la barra de búsqueda
  toggleSearchBar() {
    this.showSearchBar = !this.showSearchBar;
    if (!this.showSearchBar) {
      this.searchText = '';
      this.searchProducts();
    }
  }

  // Filtra los productos según el texto de búsqueda
  searchProducts() {
    this.filteredProducts = this.products.filter(product => 
      product.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // Muestra u oculta el filtro de categoría
  toggleCategoryFilter() {
    this.showCategoryFilter = !this.showCategoryFilter;
  }

  // Filtra los productos según la categoría seleccionada
  filterProducts() {
    if (this.selectedCategory) {
      this.filteredProducts = this.products.filter(product => 
        product.categoria === this.selectedCategory
      );
    } else {
      this.filteredProducts = [...this.products];
    }
  }

  // Limpia el filtro de categoría
  clearFilter() {
    this.selectedCategory = '';
    this.filterProducts();
  }

  // Elimina un producto dado su ID
  async deleteProduct(product: any) {
    const { userId, id: productId } = product;
    if (!userId || !productId) {
      console.error('userId o productId no definidos:', { userId, productId });
      return;
    }
  
    try {
      await this.firebaseSvc.deleteProduct(userId, productId);
      this.products = this.products.filter(p => p.id !== productId);
      this.filteredProducts = this.filteredProducts.filter(p => p.id !== productId);
      console.log(`Producto ${productId} eliminado correctamente para el usuario ${userId}`);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  }

  
  

  // Navega a la página de detalles de reflexiones de un producto
  goToReflectionDetails(productId: string) {
    this.navCtrl.navigateForward(`/admin-main/admin-reflexiones/${productId}`);
  }
}
