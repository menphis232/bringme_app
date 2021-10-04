import { Component, OnInit,ViewChild } from '@angular/core';
import { ServerService } from '../service/server.service';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { IonBackButtonDelegate } from '@ionic/angular';
import {Globals} from '../app.globals';
import { NavController,Platform,LoadingController,IonSlides,Events } from '@ionic/angular';

@Component({
  selector: 'app-blog',
  templateUrl: 'blog.page.html',
  styleUrls: ['blog.page.scss'],
})
export class BlogPage {
  
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
  @ViewChild(IonBackButtonDelegate, { static: false }) backButton: IonBackButtonDelegate;
  city_name:any;
  data:any;
  fakeData = [1,2,3,4,5,6,7];
  oldData:any;
  showLoading = false;
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
  searchTimeout:any;

  constructor(private platform: Platform,globals: Globals,public modalController: ModalController,public alertController: AlertController,public toastController: ToastController,public server : ServerService,private nav: NavController,public events: Events)
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
      this.nav.navigateForward('/home');
    }
    if(localStorage.getItem('article_id'))
    {
      localStorage.removeItem('article_id');
    }

    this.city_name = localStorage.getItem('city_name');

    this.loadData();

  }

  ionViewDidEnter()
  {
    this.setUIBackButtonAction();
  }

  ngOnInit()
  {
    this.searchQuery = null;
    this.hasSearch   = false;
  }

  async loadData()
  {
    var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;

    this.server.blogpage("?lid="+lid).subscribe((response:any) => {

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

  articlePage(articleData)
  {    
    localStorage.setItem('article_id', articleData.id);
    this.nav.navigateForward('/article');
  }

  async presentToast(txt) {
    const toast = await this.toastController.create({
      message: txt,
      duration: 1500
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

  setUIBackButtonAction() {
    this.backButton.onClick = () => {
      this.nav.back();
    };

    this.platform.backButton.subscribeWithPriority(2, () => {
      this.nav.back();
    });
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

  navigateRoot(url){
    this.nav.navigateRoot(url);
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
