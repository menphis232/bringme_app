import { Component, OnInit,ViewChild } from '@angular/core';
import { ServerService } from '../service/server.service';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { IonBackButtonDelegate } from '@ionic/angular';
import {Globals} from '../app.globals';
import { NavController,Platform,LoadingController,IonSlides,Events,IonContent } from '@ionic/angular';

@Component({
  selector: 'app-stores',
  templateUrl: 'stores.page.html',
  styleUrls: ['stores.page.scss'],
})
export class StoresPage {
  
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
  @ViewChild(IonBackButtonDelegate, { static: false }) backButton: IonBackButtonDelegate;
  city_name:any;
  data:any;
  fakeData = [1,2,3,4,5,6,7];
  oldData:any;
  showLoading = false;
  parent_category:any = false;
  category:any;
  cart_no:any;
  filterPress:any;
  hasSearch = false;
  searchQuery:any;
  searchLength:any;
  categories_results:any;
  products_results:any;
  count:any;
  text:any;
  quartier:any;
  searchTimeout:any;
  quartier_name:any;
  canBack:any = 1;

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
      this.nav.navigateForward('/home');
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
  }

  ngOnInit()
  {
    this.searchQuery = null;
    this.hasSearch   = false;
    if(localStorage.getItem('subcategory_id')){
      localStorage.removeItem('subcategory_id');
    }
    if(localStorage.getItem('product_id')){
      localStorage.removeItem('product_id');
    }
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

    this.server.storespage(quartier_id, category_id+"?lid="+lid).subscribe((response:any) => {

    if(response.data.store instanceof Array){
      response.data.store.sort((a,b) => {
      
        if(a.open > b.open){
          return -1;
        }
        if(a.open < b.open){
          return 1;
        }
        return 0;

      });
    }

    if(localStorage.getItem('parent_category') && localStorage.getItem('parent_category')!="false"){
      this.parent_category = localStorage.getItem('parent_category');
    }

    this.data = response.data;
    this.text = response.data.text;
    this.quartier = response.data.quartier;

    this.events.publish('text', this.text);

    localStorage.setItem('app_text', JSON.stringify(response.data.text));


    setTimeout(() => {this.content.scrollToPoint(0, 160, 500);}, 800);


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
        root.server.search(localStorage.getItem('quartier_id'), val, root.category.id).subscribe((response:any) => {

          root.categories_results = response.data.categories;
          root.products_results = response.data.products;

          root.loadData(localStorage.getItem('quartier_id'), root.category.id);

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
      this.loadData(localStorage.getItem('quartier_id'), localStorage.getItem('city_id')+"?banner="+offer.id);
    }
  }

  doRefresh(event) {

    this.loadData(localStorage.getItem('quartier_id'), this.category.id);

    setTimeout(() => {
      
      event.target.complete();
    }, 2000);
  }

  itemPage(storeData)
  {
    localStorage.setItem('menu_item', JSON.stringify(storeData));
    
    this.nav.navigateForward('/item');
  }

  storePage(storeData)
  {
    localStorage.setItem('parent_category', localStorage.getItem('category'));
    localStorage.setItem('category', JSON.stringify(storeData));
     
    if(storeData.childHasChild){
      this.category = storeData;
      this.loadData(localStorage.getItem('quartier_id'), this.category.id);
    }
    else{
      this.nav.navigateForward('/store');
    }
  }

  async presentToast(txt, clr='dark') {
    const toast = await this.toastController.create({
      message: txt,
      duration: 1500,
      color: clr
    });
    toast.present();
  }

  async modalOnLeave(){
    const alert = await this.alertController.create({
      header: 'Attention!',
      message: 'Vous avez des produits dans votre panier. Si vous souhaitez retourner en arrière, votre panier sera vidé! Etes-vous sûr de vouloir continuer?',
      buttons: [
        {
          text: 'Rester',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.canBack = 1;
          }
        }, {
          text: 'Quitter',
          handler: () => {
            this.server.emptyCart(localStorage.getItem('cart_no')).subscribe((response:any) => {
              if(response.data){
                this.presentToast("Panier vidé", 'warning');
                this.count = 0;
                this.backView();
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  setUIBackButtonAction() {
    this.backButton.onClick = () => {
      console.log('press back stores');
      if(this.canBack){
        console.log('can press back stores');
        this.canBack = 0;
        if(localStorage.getItem('parent_category')){
          if(this.count && (((this.category.admin_id != JSON.parse(localStorage.getItem('parent_category')).admin_id) && !JSON.parse(localStorage.getItem('parent_category')).marketplace) || !JSON.parse(localStorage.getItem('category')).parent_id)){
            this.modalOnLeave();
          }
          else{
            this.backView();
          }
        }
        else{
          if(this.count){
            this.modalOnLeave();
          }
          else{
            this.backView();
          }
        }
      }
    };

    this.platform.backButton.subscribeWithPriority(2, () => {
      if(this.canBack){
        this.canBack = 0;
        if(localStorage.getItem('parent_category')){
          if(this.count && (((this.category.admin_id != JSON.parse(localStorage.getItem('parent_category')).admin_id) && !JSON.parse(localStorage.getItem('parent_category')).marketplace) || !JSON.parse(localStorage.getItem('category')).parent_id)){
            this.modalOnLeave();
          }
          else{
            this.backView();
          }
        }
        else{
          if(this.count){
            this.modalOnLeave();
          }
          else{
            this.backView();
          }
        }
      }
    });
  }

  checkPromos(){
    this.nav.navigateForward('/promos');
  }

  backView(){
    this.searchLength = 0;
    this.hasSearch = false;
    if(localStorage.getItem('parent_category') && localStorage.getItem('parent_category')!="false" && localStorage.getItem('parent_category')!="null"){
      localStorage.setItem('category', localStorage.getItem('parent_category'));
      if(JSON.parse(localStorage.getItem('category')).parent_id != "0"){
        this.server.getCategory(JSON.parse(localStorage.getItem('category')).parent_id).subscribe((response:any) => {
          localStorage.setItem('parent_category', JSON.stringify(response.data));
        });
      }
      else{
        localStorage.removeItem('parent_category');
      }
      this.category = JSON.parse(localStorage.getItem('category'));
      this.loadData(localStorage.getItem('quartier_id'), this.category.id);
      this.canBack = 1;
    }
    else{
      this.nav.navigateRoot('/home');
      this.canBack = 1;
    }
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
                if(localStorage.getItem('remarques')){
                  localStorage.removeItem('remarques');
                }
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
