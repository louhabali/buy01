import { Routes } from '@angular/router';

import { ProductsComponent } from './pages/products/products.component';
import { AddProductComponent } from './pages/add-product/add-product.component';
import { EditProductComponent } from './pages/edit-product/edit-product.component';

export const routes: Routes = [

    {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
    },

    {
        path: 'products',
        component: ProductsComponent
    },

    {
        path: 'products/add',
        component: AddProductComponent
    },

    {
        path: 'products/edit/:id',
        component: EditProductComponent
    }

];