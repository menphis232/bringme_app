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
  selector: 'app-store',
  templateUrl: 'store.page.html',
  styleUrls: ['store.page.scss']
})
export class StorePage {
  
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
    slidesPerView: 7.8,
    loop: false,
    centeredSlides: true,
    centeredSlidesBounds: true,
    speed: 500,
    spaceBetween:5,

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
  selectedCategoryName:any;
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
      this.subcategories.forEach((item) => {
        if(item.id == categoryId){
          this.selectedCategoryName = item.name;
        }
      });
    }
    else{
      this.selectedCategory = 0;
      this.promo = 1;
      index = -1;
      this.selectedCategoryName = 'Promotions';
    }
    // if(this.data.promos_count && this.category.first_category){
    //   this.slides.slideTo(index+1, 1000);
    // }
    // else{
    //   this.slides.slideTo(index, 1000);
    // }
  }

  slideChanged(){
    // this.slides.getActiveIndex().then(index => {
    //   let currentIndex = index;
    //   if(this.data.promos_count && this.category.first_category){
    //     if(index != -1){
    //       this.selectedCategory = this.subcategories[currentIndex-1].id;
    //       this.promo = 0;
    //     }
    //     else{
    //       this.selectedCategory = 0;
    //       this.promo = 1;
    //     }
    //   }
    //   else{
    //     this.selectedCategory = this.subcategories[currentIndex].id;
    //   }
    // });
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

    this.server.storepage(quartier_id, category_id, localStorage.getItem('cart_no')+"?lid="+lid).subscribe((response:any) => {

    this.data = response.data;
    this.subcategories = this.data.subcategories;

    this.products = this.data.products;
    this.text = response.data.text;
    this.quartier = response.data.quartier;

    this.products.forEach((item, index) => {
      item.price = parseInt(item.price);
      item.enabled = true;
    })

    this.events.publish('text', this.text);

    localStorage.setItem('app_text', JSON.stringify(response.data.text));

    if(this.data.promos_count && this.category.first_category){
      this.promo = 1;
      this.selectedCategory = 0;
      this.filterData("promo", -1);
    }
    else{
      this.selectedCategory = this.subcategories[0].id;
      this.selectedCategoryName = this.subcategories[0].name;
      this.filterData(this.selectedCategory, 0);
    }

    });
  }

  search(ev)
  {
    var val = ev.target.value;

    if(val && val.length > 0)
    {
      this.data      = null;
      this.hasSearch = val;

      this.loadData(localStorage.getItem('quartier_id'), localStorage.getItem('city_id')+"?q="+val);
    }
    else
    {
      this.ngOnInit();
      this.hasSearch = false;
    }
  }

  async dataFilter(type)
  {
    this.filterPress = type;
    await this.delay(1000);
    this.filterPress = null;

    if(type == 1)
    {
      this.data.category.sort((a,b) => {
    
        return parseFloat(b.discount_value) - parseFloat(a.discount_value);

        });
    }
    else if(type == 2)
    {
      this.data.category.sort((a,b) => {
    
        return parseFloat(a.delivery_time) - parseFloat(b.delivery_time);

        });
    }
    else if(type == 3)
    {
      this.data.category.sort((a,b) => {
    
        return parseFloat(b.trending) - parseFloat(a.trending);

        });
    }
    else if(type == 4)
    {
        this.data.category.sort((a,b) => {
    
        return parseFloat(b.id) - parseFloat(a.id);

        });
    }
    else if(type == 5)
    {
      this.data.category.sort((a,b) => {
    
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

    localStorage.setItem('subcategory_id', this.selectedCategory);
    this.ngOnInit();

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
    localStorage.setItem('menu_item', JSON.stringify(storeData));
    
    this.nav.navigateForward('/store');
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
          }
        }, {
          text: 'Quitter',
          handler: () => {
            this.server.emptyCart(localStorage.getItem('cart_no')).subscribe((response:any) => {
              if(response.data){
                this.presentToast("Panier vidé", 'warning');
                localStorage.setItem('category', localStorage.getItem('parent_category'));
                this.server.getCategory(JSON.parse(localStorage.getItem('category')).parent_id).subscribe((response:any) => {
                  localStorage.setItem('parent_category', JSON.stringify(response.data));
                });
                this.nav.navigateForward('/stores');
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
      if(this.canBack){
        this.canBack = 0;
        if(this.count && (this.category.admin_id != JSON.parse(localStorage.getItem('parent_category')).admin_id) && !JSON.parse(localStorage.getItem('parent_category')).marketplace){
          this.modalOnLeave();
        }
        else{
          localStorage.setItem('category', localStorage.getItem('parent_category'));
          if(JSON.parse(localStorage.getItem('category')).parent_id != "0"){
            this.server.getCategory(JSON.parse(localStorage.getItem('category')).parent_id).subscribe((response:any) => {
              localStorage.setItem('parent_category', JSON.stringify(response.data));
            });
          }
          else{
            localStorage.removeItem('parent_category');
          }
          this.nav.navigateForward('/stores');
        }
      }
      setTimeout(() => {this.canBack = 1;}, 1000);
    };

    this.platform.backButton.subscribeWithPriority(2, () => {
      if(this.canBack){
        this.canBack = 0;
        if(this.count && (this.category.admin_id != JSON.parse(localStorage.getItem('parent_category')).admin_id) && !JSON.parse(localStorage.getItem('parent_category')).marketplace){
          this.modalOnLeave();
        }
        else{
          localStorage.setItem('category', localStorage.getItem('parent_category'));
          if(JSON.parse(localStorage.getItem('category')).parent_id != "0"){
            this.server.getCategory(JSON.parse(localStorage.getItem('category')).parent_id).subscribe((response:any) => {
              localStorage.setItem('parent_category', JSON.stringify(response.data));
            });
          }
          else{
            localStorage.removeItem('parent_category');
          }
          this.nav.navigateForward('/stores');
        }
      }
      setTimeout(() => {this.canBack = 1;}, 1000);
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
