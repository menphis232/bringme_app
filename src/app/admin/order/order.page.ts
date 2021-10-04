import { Component, OnInit,ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerService } from '../../service/server.service';
import { IonBackButtonDelegate } from '@ionic/angular';
import { ToastController,NavController,Platform,LoadingController,IonSlides,AlertController } from '@ionic/angular';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})

export class OrderPage implements OnInit {

  SubcategoriesOption = {
    initialSlide: 0,
    slidesPerView: 2.8,
    loop: false,
    centeredSlides: true,
    speed: 500,
    spaceBetween:20,

  }

@ViewChild('subcategoriesSlider', {static: false}) slides: IonSlides;
@ViewChild(IonBackButtonDelegate, { static: false }) backButton: IonBackButtonDelegate;
data:any;
text:any;
isMultipleBiller:any = 0;
isOwner:any = 0;
dataList:any;
index:any = 0;
history:any = 0;

  constructor(private platform: Platform,private route: ActivatedRoute,public server : ServerService,public toastController: ToastController,private nav: NavController,public loadingController: LoadingController,public alertController: AlertController){

    this.text = JSON.parse(localStorage.getItem('app_text'));
  
  }

  ngOnInit()
  {
    if(localStorage.getItem('history') && localStorage.getItem('history')!="null"){
      this.history = 1;
    }
  }

  ionViewWillEnter()
  {
    this.setUIBackButtonAction();
    if(!localStorage.getItem('user_id') || localStorage.getItem('user_id') == 'null')
    {
      this.nav.navigateRoot('/login');

      this.presentToast("Merci de bien vouloir vous connecter pour pouvoir accéder à votre profil.", 'secondary');
    }
    else
    {
      this.loadData();
    }
  }

  async loadData()
  {
    const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
    });
    await loading.present();

    var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;

    this.server.myBillerOrder(localStorage.getItem('user_id'), this.history+"?lid="+lid).subscribe((response:any) => {
  
    this.data = response.data;


    this.dataList = [];
    
    for (let i = 0; i < Math.min(this.data.length, 20); i++) { 
      this.dataList.push(this.data[i]);
      this.index = i;
    }
    this.index += 1;

    if(response.owner){
      this.isOwner = 1;
    }

    loading.dismiss();

    });
  }
 
  loadMore(event) {
    
    setTimeout(() => {
      let max = this.index + 20;
      for (let i = this.index; i < max; i++) { 
        this.dataList.push(this.data[i]);
        this.index = i;
      }
      event.target.complete();
 
      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if (this.index >= this.data.length - 1) {
        event.target.disabled = true;
      }
    }, 500);
  }

  filterData(index){
    this.isMultipleBiller = index;
    this.slides.slideTo(index, 1000);
  }

  slideChanged(){
    this.slides.getActiveIndex().then(index => {
      this.isMultipleBiller = index;
    });
  }

  rate()
  {
    this.nav.navigateForward('/login');
  }

  async cancelOrder(id) {
    const alert = await this.alertController.create({
      header: 'Annuler la commande!',
      message: 'Etes-vous sûr de vouloir annuler cette commande?',
      mode:'ios',
      buttons: [
        {
          text: 'Non',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {


          }
        }, {
          text: 'Oui',
          handler: () => {
           
          	this.cnc(id);

          }
        }
      ]
    });

    await alert.present();
  }

  async cnc(id)
  {
    const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
    });
    await loading.present();

    this.server.cancelOrder(id,localStorage.getItem('user_id')).subscribe((response:any) => {

    this.presentToast("Commande annulée.", 'danger');

    this.loadData();

    loading.dismiss();

    });
  }

  async updateStatus(id, status)
  {
    const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
    });
    await loading.present();

    this.server.updateOrderStatus(id,localStorage.getItem('user_id'),status).subscribe((response:any) => {

    this.presentToast("Statut mis à jour.", 'secondary');

    this.loadData();

    loading.dismiss();

    });
  }

  orderDetail(id){
    localStorage.setItem('order_id', id);
    this.nav.navigateForward('/admin-singleorder');
  }

  doRefresh(event) {

    this.loadData();

    setTimeout(() => {
      
      event.target.complete();
    }, 2000);
  }

  async presentToast(txt, clr='dark') {
    const toast = await this.toastController.create({
      message: txt,
      duration: 3000,
      position : 'top',
      mode:'ios',
      color:clr
    });
    toast.present();
  }

  setUIBackButtonAction() {
    this.backButton.onClick = () => {
      this.nav.navigateRoot('/admin-profile');
    };

    this.platform.backButton.subscribeWithPriority(2, () => {
      this.nav.navigateRoot('/admin-profile');
    });
  }
}
