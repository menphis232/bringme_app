import { Component, OnInit, ViewChild } from '@angular/core';
import { ServerService } from '../service/server.service';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { IonContent } from '@ionic/angular';
import { IonBackButtonDelegate } from '@ionic/angular';
import {Globals} from '../app.globals';
import { OptionPage } from '../option/option.page';
import { NavController,Platform,LoadingController,IonSlides,Events } from '@ionic/angular';

@Component({
  selector: 'app-promos',
  templateUrl: 'promos.page.html',
  styleUrls: ['promos.page.scss']
})
export class PromosPage {
  
  BannerOption = {
    initialSlide: 0,
    slidesPerView: 2.3,
    loop: true,
    centeredSlides: false,
    autoplay:false,
    speed: 500,
    spaceBetween:7,

  }

  SearchOption = {
    initialSlide: 0,
    slidesPerView: 3.5,
    loop: false,
    centeredSlides: false,
    autoplay:false,
    speed: 500,
    spaceBetween:-20,

  }

  SubcategoriesOption = {
    initialSlide: 0,
    slidesPerView: 2.8,
    loop: false,
    centeredSlides: true,
    speed: 500,
    spaceBetween:20,

  }

  TrendOption = {
    initialSlide: 0,
    slidesPerView: 1.4,
    loop: true,
    centeredSlides: false,
    autoplay:false,
    speed: 800,
    spaceBetween:-9,

  }

  MiddleBannerOption = {
    initialSlide: 0,
    slidesPerView: 1.3,
    loop: false,
    centeredSlides: false,
    autoplay:true,
    speed: 800,
    spaceBetween:7,

  }
  
  globals: Globals;
  @ViewChild(IonBackButtonDelegate, { static: false }) backButton: IonBackButtonDelegate;
  @ViewChild('subcategoriesSlider', {static: false}) slides: IonSlides;
  @ViewChild(IonContent, {static: false}) content: IonContent;
  city_name:any;
  data:any;
  qty:any;
  subcategories:any;
  quartier:any;
  category:any;
  cart_no:any;
  products:any;
  selectedCategory:any;
  fakeData = [1,2,3,4,5,6,7];
  oldData:any;
  showLoading = false;
  filterPress:any;
  hasSearch = false;
  searchQuery:any;
  count:any;
  promo:any = 0;
  text:any;
  quartier_name:any;
  canBack = 1;

  constructor(private platform: Platform,globals: Globals,public modalController: ModalController,public alertController: AlertController,public toastController: ToastController,public server : ServerService,private nav: NavController,public events: Events)
  {
    this.globals = globals;
  }

  ionViewWillEnter()
  {
    if(localStorage.getItem('cart_no') == 'null' || localStorage.getItem('cart_no') == undefined)
    {
      this.cart_no = Math.floor(Math.random()*2000000000)+1;

      localStorage.setItem('cart_no',this.cart_no);
    }
    if(localStorage.getItem('app_text'))
    {
      this.text = JSON.parse(localStorage.getItem('app_text'));
    }
    else{
      this.nav.navigateRoot('/home');
    }
    if(localStorage.getItem('category'))
    {
      this.category = JSON.parse(localStorage.getItem('category'));
    }
    else{
      this.nav.navigateRoot('/home');
    }

    this.city_name = localStorage.getItem('city_name');
  
    this.server.cartCount(localStorage.getItem('cart_no')).subscribe((response:any) => {

      this.count = response.data;

     });

    this.loadData(localStorage.getItem('quartier_id'), this.category.id);

  }

  ionViewDidEnter()
  {
    this.setUIBackButtonAction();
    if(localStorage.getItem('subcategory_id')){
      document.getElementById('slide'+localStorage.getItem('subcategory_id')).click();
      localStorage.removeItem('subcategory_id');
    }
    if(localStorage.getItem('product_id')){
      let yOffset = document.getElementById('product'+localStorage.getItem('product_id')).offsetTop;
      setTimeout(() => {this.content.scrollToPoint(0, yOffset, 1500);}, 500);
      localStorage.removeItem('product_id');
    }
  }

  async showItem(item,currency,index) {
    const modal = await this.modalController.create({
      component: OptionPage,
      animated:true,
      mode:'ios',
      cssClass: 'my-custom-modal-css',
      backdropDismiss:false,
      componentProps: {
      'index': index,
      'item': item,
      'currency' : currency,
      'category' : this.category
    }

    });

   modal.onDidDismiss().then(data=>{
      
      if(data.data.count){
        this.count = data.data.count;
        this.products[index].cart_qty = parseInt(this.products[index].cart_qty) + parseInt(data.data.quantity);
      }
      this.setUIBackButtonAction();

    })

    return await modal.present();
  }

  filterData(categoryId, index){
    if(categoryId != "promo"){
      this.selectedCategory = categoryId;
      this.promo = 0;
    }
    else{
      this.selectedCategory = 0;
      this.promo = 1;
      index = this.selectedCategory.length;
    }
    this.slides.slideTo(index, 1000);
  }

  slideChanged(){
    this.slides.getActiveIndex().then(index => {
      let currentIndex = index;
      if(this.subcategories.length > index){
        this.selectedCategory = this.subcategories[currentIndex].id;
        this.promo = 0;
      }
      else{
        this.selectedCategory = 0;
        this.promo = 1;
      }
    });
  }

  ngOnInit()
  {
    this.searchQuery = null;
    this.hasSearch   = false;
  }

  nearBy()
  {
    this.data = null;
    this.loadData(localStorage.getItem('quartier_id'), this.category.id+"?lat="+localStorage.getItem('current_lat')+"&lng="+localStorage.getItem('current_lng'));
  }

  async loadData(quartier_id, category_id)
  {
    if(localStorage.getItem('quartier_name')){
      this.quartier_name = localStorage.getItem('quartier_name');
    }
    var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;

    this.server.promospage(quartier_id, category_id, localStorage.getItem('cart_no')+"?lid="+lid).subscribe((response:any) => {

    this.data = response.data;
    this.subcategories = this.data.subcategories;
    this.products = this.data.products;
    this.text = response.data.text;
    this.quartier = response.data.quartier;

    this.products.forEach((item, index) => {
      item.price = parseInt(item.price);
      item.enabled = true;
    })

    this.selectedCategory = this.subcategories[0].id;

    this.events.publish('text', this.text);

    localStorage.setItem('app_text', JSON.stringify(response.data.text));


    });
  }

  async delay(ms: number) {
    
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  doRefresh(event) {

    this.ngOnInit();

    setTimeout(() => {
      
      event.target.complete();
    }, 2000);
  }

  addToCart(product,price,index,type = 0,qty = 1,note = "")
  {
    if(product.enabled){
      product.enabled = false;
      if(product.cart_qty < product.quantity || type == 1 || !product.track_quantity){
       var allData = {
         "cart_no" : localStorage.getItem('cart_no'),
         "id" : product.id,
         "price" : price,
         "qty" : qty,
         "type" : type,
         "qtype" : 0,
         "note" : note
       };

       this.server.addToCart(allData).subscribe((response:any) => {

        this.count = response.data.count;
        this.presentToast(response.data.msg, 'secondary');
        if(type){
          this.products[index].cart_qty = parseInt(this.products[index].cart_qty) - qty;
          product.enabled = true;
        }
        else{
          this.products[index].cart_qty = parseInt(this.products[index].cart_qty) + qty;
          product.enabled = true;
        }

       });
      }
      else{
        this.presentToast('Limite de stock atteinte...', 'warning');
        product.enabled = true;
      }
    }
  }

  async presentToast(txt, clr='dark') {
    const toast = await this.toastController.create({
      message: txt,
      duration: 800,
      position: 'top',
      color: clr
    });
    toast.present();
  } 

  setUIBackButtonAction() {
    this.backButton.onClick = () => {
      this.nav.back();
    };

    this.platform.backButton.subscribeWithPriority(2, () => {
      this.nav.back();
    });
  } 

  async modalOnLocation(){
    const alert = await this.alertController.create({
      header: 'Attention!',
      message: 'Votre quartier actuel est : '+localStorage.getItem('quartier_name')+'. Si vous souhaitez changer de lieu, votre panier sera vidé! Etes-vous sûr de vouloir continuer?',
      buttons: [
        {
          text: 'Rester',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: 'Quitter',
          handler: () => {
            this.server.emptyCart(localStorage.getItem('cart_no')).subscribe((response:any) => {
              if(response.data){
                this.presentToast("Panier vidé", 'warning');
                this.nav.navigateForward('/location');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  goToLocation() {
    if(this.count){
      this.modalOnLocation();
    }
    else{
      this.nav.navigateRoot('/location');
    }
  }
}
