import { Component, OnInit,ViewChild } from '@angular/core';
import { ServerService } from '../service/server.service';
import { Globals } from '../app.globals';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { NavController,Platform,LoadingController,IonSlides,Events,IonContent } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
	
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
    slidesPerView: 1.5,
    loop: false,
    centeredSlides: true,
    autoplay:false,
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
  @ViewChild(IonContent, {static: false}) content: IonContent;
  city_name:any;
  data:any;
  fakeData = [1,2,3,4,5,6,7];
  oldData:any;
  cart_no:any;
  showLoading = false;
  searchLength:any;
  filterPress:any;
  hasSearch = false;
  searchQuery:any;
  categories_results:any;
  products_results:any;
  count:any;
  text:any;
  searchTimeout:any;
  quartier_name:any;

  constructor(globals: Globals,public alertController: AlertController,public toastController: ToastController,public platform : Platform,public server : ServerService,private nav: NavController,public events: Events)
  {
    this.globals = globals;
  }

  ionViewWillEnter()
  {
    this.platform.ready().then(() => {
      if(localStorage.getItem('user_id') && localStorage.getItem('user_id') != "null"){
        this.server.userInfo(localStorage.getItem('user_id')).subscribe((response:any) => {

        if(response.data.biller_id || response.data.group_id == "1"){
          this.nav.navigateRoot('admin-profile');
        }

        });
      }
      localStorage.removeItem('parent_category');
      if(localStorage.getItem('cart_no') == 'null' || localStorage.getItem('cart_no') == undefined)
      {
        this.cart_no = Math.floor(Math.random()*2000000000)+1;

        localStorage.setItem('cart_no',this.cart_no);
      }
      if(localStorage.getItem('app_text'))
      {
        this.text = JSON.parse(localStorage.getItem('app_text'));
      }
      if(localStorage.getItem('quartier_name')){
        this.quartier_name = localStorage.getItem('quartier_name');
      }

      this.loadData(localStorage.getItem('quartier_id'));
    });

  }

  ionViewDidEnter(){
  }

  ngOnInit()
  {
    this.searchQuery = null;
    this.hasSearch   = false;
  }

  nearBy()
  {
    this.data = null;
    this.loadData(localStorage.getItem('quartier_id')+"?lat="+localStorage.getItem('current_lat')+"&lng="+localStorage.getItem('current_lng'));
  }

  async loadData(quartier_id)
  {
    var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;

    this.server.homepage(quartier_id+"?lid="+lid).subscribe((response:any) => {

    this.data = response.data;

    this.text = response.data.text;

    this.events.publish('text', this.text);

    localStorage.setItem('app_text', JSON.stringify(response.data.text));

    if(!localStorage.getItem('quartier_id')){
      this.nav.navigateRoot('/location');
    }
    else{

      response.data.store.sort((a,b) => {
      
        if(a.open > b.open){
          return -1;
        }
        if(a.open < b.open){
          return 1;
        }
        return 0

      });

      this.city_name = localStorage.getItem('city_name');
    
      this.server.cartCount(localStorage.getItem('cart_no')).subscribe((response:any) => {

        this.count = response.data;

        if(this.count){

          this.server.getCartView(localStorage.getItem('cart_no')).subscribe((response3:any) => {
            setTimeout(() => {this.modalOnCart(response3.data.id);}, 500);
          });
        }

       });

      setTimeout(() => {this.content.scrollToPoint(0, 160, 500);}, 800);
      
    }

    });
  }

  search(ev)
  {
    var val = ev.target.value;

    if(val && val.length > 0)
    {
      this.searchLength = val.length;
      this.data      = null;
      this.hasSearch = val;
      var root = this;
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(function(){
        root.server.search(localStorage.getItem('quartier_id'), val).subscribe((response:any) => {

          root.categories_results = response.data.categories;
          root.products_results = response.data.products;

          root.loadData(localStorage.getItem('quartier_id'));

        });
      }, 200);
    }
    else
    {
      this.ngOnInit();
      this.searchLength = 0;
      this.hasSearch = false;
    }
  }

  goToCategory(category_id, product_id = 0, subcategory_id = 0){
    this.server.isLastCategory(category_id).subscribe((response:any) => {
      if(response.data){
        this.server.getCategory(category_id).subscribe((response1:any) => {
          localStorage.setItem('category', JSON.stringify(response1.data));
          if(response1.data.parent_id != "0"){
            this.server.getCategory(response1.data.parent_id).subscribe((response2:any) => {
              localStorage.setItem('parent_category', JSON.stringify(response2.data));
              if(product_id){
                  localStorage.setItem('product_id', ""+product_id);
              }
              if(subcategory_id){
                  localStorage.setItem('subcategory_id', ""+subcategory_id);
              }
              this.nav.navigateForward('/store');
            });
          }
        });
      }else{
        this.server.getCategory(category_id).subscribe((response1:any) => {
          localStorage.setItem('category', JSON.stringify(response1.data));
          if(response1.data.parent_id != "0"){
            this.server.getCategory(response1.data.parent_id).subscribe((response2:any) => {
              localStorage.setItem('parent_category', JSON.stringify(response2.data));
              this.nav.navigateForward('/stores');
            });
          }
          else{
            localStorage.removeItem('parent_category');
            this.nav.navigateForward('/stores');
          }
        });
      }
    });
  }

  async dataFilter(type)
  {
    this.filterPress = type;
    await this.delay(1000);
    this.filterPress = null;

    if(type == 1)
    {
      this.data.store.sort((a,b) => {
    
        return parseFloat(b.discount_value) - parseFloat(a.discount_value);

        });
    }
    else if(type == 2)
    {
      this.data.store.sort((a,b) => {
    
        return parseFloat(a.delivery_time) - parseFloat(b.delivery_time);

        });
    }
    else if(type == 3)
    {
      this.data.store.sort((a,b) => {
    
        return parseFloat(b.trending) - parseFloat(a.trending);

        });
    }
    else if(type == 4)
    {
        this.data.store.sort((a,b) => {
    
        return parseFloat(b.id) - parseFloat(a.id);

        });
    }
    else if(type == 5)
    {
      this.data.store.sort((a,b) => {
    
        return parseFloat(b.rating) - parseFloat(a.rating);

        });
    }
    else if(type == 6)
    {
      
    }
    else if(type == 7)
    {
      
    }
  }

  async delay(ms: number) {
    
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  bannerLink(offer)
  {
    if(offer.link)
    {
      this.data = null;
      this.loadData(localStorage.getItem('quartier_id')+"?banner="+offer.id);
    }
  }

  doRefresh(event) {

    this.loadData(localStorage.getItem('quartier_id'));

    setTimeout(() => {
      
      event.target.complete();
    }, 2000);
  }

  itemPage(storeData)
  {
    localStorage.setItem('menu_item', JSON.stringify(storeData));
    
    this.nav.navigateForward('/item');
  }

  storesPage(storeData)
  {
    localStorage.setItem('category', JSON.stringify(storeData));
    
    this.nav.navigateForward('/stores');
  }

  profileClick(){
    if(localStorage.getItem('user_id') && localStorage.getItem('user_id') != "null"){
      this.server.userInfo(localStorage.getItem('user_id')).subscribe((response:any) => {

      if(response.data.biller_id){
        this.nav.navigateForward('admin-profile');
      }
      else{
        this.navigateForward('/profile');
      }

      });
    }
    else{
      this.navigateForward('/login');
    }
  }

  navigateForward(url){
    this.nav.navigateForward(url);
  }

  goToLocation() {
    this.nav.navigateRoot('/location');
  }

  async modalOnCart($category_id){
    const alert = await this.alertController.create({
      header: 'Attention!',
      message: 'Vous avez des produits dans votre panier. Souhaitez-vous continuer vos achats afin de les conserver ?',
      buttons: [
        {
          text: 'Rester',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.server.emptyCart(localStorage.getItem('cart_no')).subscribe((response:any) => {
              if(response.data){
                this.presentToast("Panier vidé", 'warning');
                this.count = 0;
              }
            });
          }
        }, {
          text: 'Continuer',
          handler: () => {
            this.goToCategory($category_id);
          }
        }
      ]
    });

    await alert.present();
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
}
