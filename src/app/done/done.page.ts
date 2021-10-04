import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-done',
  templateUrl: './done.page.html',
  styleUrls: ['./done.page.scss'],
})
export class DonePage implements OnInit {
 
 data:any;
 text:any;
 currency:any;
  constructor() { }

  ngOnInit() 
  {
   this.data   = JSON.parse(localStorage.getItem('order_data'));
   this.text 	 = JSON.parse(localStorage.getItem('app_text'));
   this.currency = this.data.currency;
   this.data 	 = this.data.data;

  }

}
