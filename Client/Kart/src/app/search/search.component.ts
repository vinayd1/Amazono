import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { RestApiService } from '../rest-api.service';
import { DataService } from '../data.service';
import { LowerCasePipe } from '@angular/common';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  query: string;
  page = 1;

  content: any;

  constructor(
    private data: DataService,
    private activatedRoute: ActivatedRoute,
    private rest: RestApiService
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(res => {
      this.query = res['query'];
      this.page = 1;
      this.getProducts();
    });

  }

  get lower() {
    return 1 + this.content.hitsPerPage * this.content.page;
  }

  get upper() {
    return Math.min(
      this.content.hitsPerPage * (this.content.page + 1),
      this.content.nbHits
    )
  }

  async getProducts() {
    this.content = null;
    try{
      const data = await this.rest.get(
        `http://localhost:3030/api/search?query=${this.query}&${this.page -1}`
      );
      data['success']
        ? (this.content = data['content'])
        : this.data.error(data['message']);
        console.log(this.content);
    } catch (error) {
      this.data.error(error['message']);
    }
  }

}
