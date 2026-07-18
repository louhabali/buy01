import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';


import { ProductService } from '../../core/services/product.service';


@Component({
selector:'app-edit-product',
standalone:true,
imports:[
 CommonModule,
 FormsModule
],
templateUrl:'./edit-product.component.html',
styleUrl:'./edit-product.component.css'
})
export class EditProductComponent implements OnInit{


private productService =
inject(ProductService);


private route =
inject(ActivatedRoute);


private router =
inject(Router);



id!:string;


name='';

price=0;


images:File[]=[];



ngOnInit(){

this.id =
this.route.snapshot.params['id'];



this.productService
.getProduct(this.id)
.subscribe(product=>{


this.name =
product.name;


this.price =
product.price;


});


}



selectImages(event:any){

this.images =
Array.from(event.target.files);

}



update(){


const form =
new FormData();


form.append(
'name',
this.name
);


form.append(
'price',
this.price.toString()
);



this.images.forEach(img=>{


form.append(
'images',
img
);


});



this.productService
.updateProduct(this.id,form)
.subscribe(()=>{


alert("Updated");


this.router.navigate([
'/products'
]);


});


}



}