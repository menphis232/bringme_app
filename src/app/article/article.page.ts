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
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-article',
  templateUrl: 'article.page.html',
  styleUrls: ['article.page.scss']
})
export class ArticlePage {
  
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
  text:any;

  constructor(public sanitizer: DomSanitizer,private platform: Platform,globals: Globals,public modalController: ModalController,public alertController: AlertController,public toastController: ToastController,public server : ServerService,private nav: NavController,public events: Events)
  {
    this.globals = globals;
  }

  ionViewWillEnter()
  {
    if(localStorage.getItem('app_text'))
    {
      this.text = JSON.parse(localStorage.getItem('app_text'));
    }
    else{
      this.nav.navigateRoot('/home');
    }
    if(!localStorage.getItem('article_id'))
    {
      this.nav.navigateRoot('/home');
    }

    this.loadData();

  }

  async loadData()
  {
    var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;

    this.server.articlepage(localStorage.getItem('article_id')+"?lid="+lid).subscribe((response:any) => {

    this.data = response.data;
    this.text = response.data.text;

    this.events.publish('text', this.text);

    localStorage.setItem('app_text', JSON.stringify(response.data.text));


    });
  }

  doRefresh(event) {

    this.loadData();

    setTimeout(() => {
      
      event.target.complete();
    }, 2000);
  }

  async presentToast(txt) {
    const toast = await this.toastController.create({
      message: txt,
      duration: 800,
    position: 'top'
    });
    toast.present();
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
                this.presentToast("Panier vidé");
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
