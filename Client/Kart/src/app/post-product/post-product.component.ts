import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { RestApiService } from '../rest-api.service';

@Component({
  selector: 'app-post-product',
  templateUrl: './post-product.component.html',
  styleUrls: ['./post-product.component.scss']
})
export class PostProductComponent implements OnInit {

  product = {
    title: '',
    price: 0,
    categoryId: '',
    description: '',
    productPicture: null
  };

  categories: any;
  btnDisabled = false;

  constructor(
    private router: Router, 
    private data: DataService, 
    private rest: RestApiService
  ) { }

  async ngOnInit() {
    try {
      const data = await this.rest.get(
        'http://localhost:3030/api/categories'
      );
      console.log(data);
      data['success']
        ? (this.categories = data['categories'])
        : this.data.error(data['message']);
    } catch(error) {
      this.data.error(error['message']);
    }
  }

  validate(product) {
    if(product.title) {
      if(product.price) {
        if(product.categoryId) {
          if(product.description) {
            if(product.productPicture) {
              return true;
            } else {
              this.data.error('Please selecy a product image.')
            }
          } else {
            this.data.error('Please enter a Description.')
          }
        } else {
          this.data.error('Please select category.');
        }
      } else {
        this.data.error('Please enter a price.');
      }
    } else {
      this.data.error('Please enter a title.')
    }
  }

  fileChange(event: any) {
    this.product.productPicture = event.target.files[0];
  }

  async post() {
    this.btnDisabled = true;
    try {
      if(this.validate(this.product)) {
        const form = new FormData();
        for (const key in this.product) {
          if(this.product.hasOwnProperty(key)){
            if(key === 'productPicture') {
              form.append(
                'productPicture',
                this.product.productPicture,
                this.product.productPicture.name
              );
            } else {
              form.append(key, this.product[key]);
            }
          }     
        }
        const data = await this.rest.post(
          'http://localhost:3030/api/seller/products',
          form
        );
        data['success']
          ? this.router.navigate(['/profile/myproducts'])
            .then(() => this.data.success(data['message']))
            .catch(error => this.data.error(error))
          : this.data.error(data['message']);
      }
    } catch (error) {
      this.data.error(error['message']);
    }
    this.btnDisabled = false;
  }
}