import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProductService } from '../../core/services/product.service';


@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent {


  private productService = inject(ProductService);

  private router = inject(Router);


  name = '';

  price = 0;


  selectedFiles: File[] = [];

  previews: string[] = [];


  errorMessage = '';



  onFileSelected(event:any){


    this.errorMessage = '';

    this.selectedFiles = [];

    this.previews = [];



    const files: FileList = event.target.files;



    for(let i=0; i < files.length; i++){


      const file = files[i];



      // check type

      if(!file.type.startsWith('image/')){


        this.errorMessage =
        "Only images are allowed";


        continue;

      }



      // check size 2MB

      if(file.size > 2 * 1024 * 1024){


        this.errorMessage =
        "Image size must be less than 2MB";


        continue;

      }


      this.selectedFiles.push(file);


      const reader =
      new FileReader();


      reader.onload = ()=>{


        this.previews.push(
          reader.result as string
        );


      };


      reader.readAsDataURL(file);


    }


  }


  saveProduct(){


    if(!this.name || this.price <=0){


      this.errorMessage =
      "Name and price are required";


      return;

    }



    const formData =
    new FormData();



    formData.append(
      "name",
      this.name
    );



    formData.append(
      "price",
      this.price.toString()
    );



    this.selectedFiles.forEach(file=>{


      formData.append(
        "images",
        file
      );


    });




    this.productService
    .createProduct(formData)
    .subscribe({


      next:()=>{


        alert(
          "Product created successfully"
        );


        this.router.navigate([
          '/products'
        ]);


      },


      error:(err)=>{


        console.log(err);


        this.errorMessage =
        "Error while creating product";


      }


    });


  }

}