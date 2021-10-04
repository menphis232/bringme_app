import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../service/server.service';
import { AlertController } from '@ionic/angular';
import { ToastController,Platform,LoadingController,NavController,ModalController } from '@ionic/angular';
import { OfferPage } from '../../offer/offer.page';

@Component({
  selector: 'app-singleorder',
  templateUrl: './singleorder.page.html',
  styleUrls: ['./singleorder.page.scss'],
})

export class SingleorderPage implements OnInit {

  data:any;
  fakeData = [1,2,3,4,5,6,7];
  text:any;
  order:any;
  view:any;
  owner:any;

  constructor(public alertController: AlertController,public modalController: ModalController,public server : ServerService,public toastController: ToastController,public loadingController: LoadingController,private nav: NavController)
  {
   this.text = JSON.parse(localStorage.getItem('app_text'));
  }

  ngOnInit()
  {
    if(!localStorage.getItem('order_id')){
      this.nav.back();
    }
  	this.loadData();
  }

  async loadData()
  {
    var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;

  	this.server.getadminsingleorder(localStorage.getItem('order_id'),localStorage.getItem('user_id')).subscribe((response:any) => {
	
	  this.order = response.data;
    this.view = response.view;
    this.owner = response.owner;

  	});
  }
 
 async presentToast(txt, clr='dark') {
    const toast = await this.toastController.create({
      message: txt,
      duration: 1500,
      position : 'bottom',
      color: clr
    });
    toast.present();
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
          this.server.emptyCart(localStorage.getItem('singleorder_no')).subscribe((response:any) => {
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

}
