import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonBackButtonDelegate } from '@ionic/angular';
import { ServerService } from '../../service/server.service';
import { ToastController,NavController,Platform,LoadingController,AlertController } from '@ionic/angular';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})

export class OrderPage implements OnInit {

data:any;
text:any;
after_order:any = 0;

  constructor(private platform: Platform,private route: ActivatedRoute,public server : ServerService,public toastController: ToastController,private nav: NavController,public loadingController: LoadingController,public alertController: AlertController){

    this.text = JSON.parse(localStorage.getItem('app_text'));
  
  }

  ngOnInit()
  {
    if(localStorage.getItem('after_order')){
      this.after_order = 1;
      localStorage.removeItem('after_order');
      this.setUIBackButtonAction();
    }
    if(localStorage.getItem('order_id')){
      localStorage.removeItem('order_id');
    }
  }

  ionViewWillEnter()
  {
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

    this.server.myOrder(localStorage.getItem('user_id')+"?lid="+lid).subscribe((response:any) => {
  
    this.data = response.data;

    loading.dismiss();

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

  orderDetail(id){
    localStorage.setItem('order_id', id);
    this.nav.navigateForward('/singleorder');
  }

  doRefresh(event) {

    this.loadData();

    setTimeout(() => {
      
      event.target.complete();
    }, 2000);
  }

  goToHome(){
    this.nav.navigateRoot('/home');
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
    this.platform.backButton.subscribeWithPriority(2, () => {
      this.nav.navigateRoot('/home');
    });
  }

}
