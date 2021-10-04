import { Component, OnInit,ViewChild } from '@angular/core';
import { ServerService } from '../service/server.service';
import { AlertController } from '@ionic/angular';
import { IonBackButtonDelegate } from '@ionic/angular';
import { ToastController,Platform,LoadingController,NavController,ModalController } from '@ionic/angular';
import { OfferPage } from '../offer/offer.page';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})

export class CartPage implements OnInit {

  @ViewChild(IonBackButtonDelegate, { static: false }) backButton: IonBackButtonDelegate;
  data:any;
  fakeData = [1,2,3,4,5,6,7];
  discount:any = 0;
  discount_str:any;
  remarques:any = "";
  promo:any;
  codePromo:any;
  count:any;
  isenabled:any = 0;
  text:any;
  canBack = 1;

  constructor(private platform: Platform,public alertController: AlertController,public modalController: ModalController,public server : ServerService,public toastController: ToastController,public loadingController: LoadingController,private nav: NavController)
  {
   this.text = JSON.parse(localStorage.getItem('app_text'));

   if(localStorage.getItem('remarques')){
     this.remarques = localStorage.getItem('remarques');
   }
  }

  ngOnInit()
  {
    if(localStorage.getItem('promo')){
      localStorage.removeItem('promo');
    }
  	this.loadData();
  }


  ionViewDidEnter()
  {
    setTimeout(() => {console.log('event'+localStorage.getItem('user_id'));}, 1500);
  }

  ionViewWillEnter()
  {
    this.setUIBackButtonAction();
    localStorage.setItem('checkout', '1');
  }

  ionViewWillLeave()
  {
    localStorage.removeItem('checkout');
  }

  async loadData()
  {
    var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;

  	this.server.getCart(localStorage.getItem('cart_no'), localStorage.getItem('quartier_id')+"?lid="+lid).subscribe((response:any) => {
	
	  this.data = response.data;

    this.count = response.data.count;

  	});
  }

  async updateCart(id,type)
  {
    const loading = await this.loadingController.create({
      message: 'Please wait...',
      mode:'ios'
    });
    await loading.present();

    this.server.updateCart(id,type).subscribe((response:any) => {
    
    this.data = response.data;
    
    loading.dismiss();

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

  async coupen() {
    const modal = await this.modalController.create({
      component: OfferPage,
      animated:true,
      mode:'ios',
      cssClass: 'my-custom-modal-css',
      backdropDismiss:false,
      

    });

   modal.onDidDismiss().then(data=>{
    
   console.log(data.data.id);

    if(data.data.id)
    {
      this.applyCoupen(data.data.id);
    }

    })

    return await modal.present();
  }

async applyCoupen(id)
{
  const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
      mode:'ios'
    });
    await loading.present();

    this.server.applyCoupen(id,localStorage.getItem('cart_no'), localStorage.getItem('quartier_id')).subscribe((response:any) => {
    
      this.data = response.data;
      this.presentToast(response.msg, 'secondary');
    
      loading.dismiss();

    });
}

async applyCodePromo()
{
  const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
      mode:'ios'
    });
    await loading.present();

    this.server.applyCoupen(this.codePromo,localStorage.getItem('cart_no'), localStorage.getItem('quartier_id')).subscribe((response:any) => {
    
      this.data = response.data;
      this.promo = response.data.promo;

      if(this.promo && this.promo.utilisations){
        if(this.promo.type == "reduction"){
          this.discount = this.data.item_total * (this.promo.reduction / 100);
        }
        else if(this.promo.type == "remise"){
          this.discount = this.promo.remise;
        }
        else if(this.promo.type == "shipping"){
          this.data.shipping = 0;
          this.data.shipping_str = "0";
        }
      }

      localStorage.setItem('promo', JSON.stringify(this.promo));

      this.data.item_total -= this.discount;
      console.log(this.data.item_total+' '+this.discount);
      this.data.total = this.data.item_total +this.data.shipping;
      this.data.total_str = this.data.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      this.data.item_total_str = this.data.item_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      this.discount_str = this.discount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      this.presentToast(response.msg, 'secondary');
    
      loading.dismiss();

    });
}

async cartSubmit()
{
    if(!localStorage.getItem('user_id') || localStorage.getItem('user_id') == 'null')
    {
      this.nav.navigateForward('/login');

      this.presentToast("Merci de bien vouloir vous connecter pour pouvoir continuer", 'secondary');
    }
    else
    {
      localStorage.setItem('remarques', this.remarques);
      this.nav.navigateForward('/checkout');
    }
}

addToCart(item,price,type = 0,note = "",variants = [])
{

   var allData = {
     "cart_no" : localStorage.getItem('cart_no'),
     "id" : item.item_id,
     "price" : price,
     "qty" : 1,
     "type" : type,
     "qtype" : 0,
     "note" : note,
     "variants": variants
   };

   if(parseInt(item.qty) < parseInt(item.quantity) || type == 1 || !item.track_quantity){
     this.server.addToCart(allData).subscribe((response:any) => {

      this.count = response.data.count;
      this.presentToast(response.data.msg, 'secondary');

      this.loadData();

     });
   }
   else{
      this.presentToast("Limite de stock atteinte...", 'warning');
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

setUIBackButtonAction() {
  this.backButton.onClick = () => {
    console.log('cart press button');
    if(this.canBack){
      console.log('cart can press button');
      this.canBack = 0;
      this.nav.back();
    }
  }
  this.platform.backButton.subscribeWithPriority(2, () => {
    if(this.canBack){
      this.canBack = 0;
      this.nav.back();
    }
  });
} 

}
