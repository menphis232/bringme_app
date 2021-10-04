import { Component, OnInit,ViewChild } from '@angular/core';
import { ServerService } from '../service/server.service';
import { IonBackButtonDelegate } from '@ionic/angular';
import { AlertController,ToastController,Platform,LoadingController,NavController } from '@ionic/angular';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal/ngx';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})

export class CheckoutPage implements OnInit {

  @ViewChild(IonBackButtonDelegate, { static: false }) backButton: IonBackButtonDelegate;
  data:any;
  address:any;
  quartier:any;
  indications:any;
  isenabled:any;
  promo:any;
  payment:any;
  payment_id : any;
  total_amount:any;
  paypal_id:any;
  text:any;
  user:any;
  remarques:any = "";
  isDelayed:any = 0;
  delayeddays:any;
  delayedhours:any;
  shippingDay:any  = new Date().toISOString();
  shippingHour:any;
  hoursValues:any;
  isDisabled:any = 0;
  canBack = 1;
  
  constructor(public server : ServerService,public platform: Platform,public alertController: AlertController,public toastController: ToastController,public loadingController: LoadingController,private nav: NavController,private payPal: PayPal)
  {
    this.text = JSON.parse(localStorage.getItem('app_text'));
  }

  ngOnInit()
  {
   if(localStorage.getItem('remarques')){
     this.remarques = localStorage.getItem('remarques');
   }
  }

  ionViewWillEnter()
  {
    this.setUIBackButtonAction();
    if(!localStorage.getItem('user_id') || localStorage.getItem('user_id') == 'null')
    {
      this.nav.navigateRoot('/login');

      this.presentToast("Merci de bien vouloir vous connecter pour continuer.", 'secondary');
    }
    else
    {
      if(localStorage.getItem('quartier_id') && localStorage.getItem('quartier_id') != 'null'){
        this.quartier = localStorage.getItem('quartier_id');
      }
      this.loadData();
    }
  }

  setAddress(id)
  {
    this.address = id;
  }

  setPayment(id)
  {
    this.payment = id;
  }

  async loadData()
  {
  	const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
      mode: 'ios'
    });
    await loading.present();

    var lid = localStorage.getItem('lid') ? localStorage.getItem('lid') : 0;

  	this.server.getCart(localStorage.getItem('cart_no'), localStorage.getItem('quartier_id')+"?lid="+lid).subscribe((response:any) => {
	
     this.data         = response.data;
     if(localStorage.getItem('promo')){
       this.promo = JSON.parse(localStorage.getItem('promo'));
       if(this.promo.type == 'reduction'){
         this.total_amount = response.data.item_total * (1 - (this.promo.reduction/100)) + response.data.shipping;
       }
       else if(this.promo.type == 'remise'){
         this.total_amount = response.data.item_total - this.promo.remise + response.data.shipping;
       }
       else if(this.promo.type == 'shipping'){
         this.total_amount = response.data.item_total;
       }
       else{
         this.total_amount = response.data.total;
       }
     }
     else{
       this.promo = 0;
       this.total_amount = response.data.total;
     }

     this.data.total_str = this.total_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

     if(!this.data.marketplace){
       this.hoursValues = this.data.ion_picker_values.hours[0];
     }

      this.server.userInfo(localStorage.getItem('user_id')).subscribe((response2:any) => {
        this.user = response2.data;
        this.indications = response2.address.line2;

        loading.dismiss();
      });
     

  	});

    if(this.quartier){
      this.isenabled = 1;
    }
  }

  makeOrder()
  {
    if(this.payment == 2)
    {
      this.payPaypal();
    }
    else
    {
      this.order();
    }
  }

  async order()
  {
    if(this.indications=="" || !this.indications){
      this.emptyIndications();
    }
    else{
      const loading = await this.loadingController.create({
        message: 'Merci de patienter...',
        mode: 'ios'
      });
      await loading.present();
      this.isDisabled = 1;

      this.server.updateInfo({'phone': this.user.phone},localStorage.getItem('user_id')).subscribe((response2:any) => {

        if(response2.msg == 'error'){
          this.presentToast(response2.error, 'danger');
          this.isDisabled = 0;
          loading.dismiss();
        }
        else{
          if(localStorage.getItem('chosen_lat') && localStorage.getItem('chosen_lng')){
            var orderLat:any = localStorage.getItem('chosen_lat');
            var orderLng:any = localStorage.getItem('chosen_lng');
          }
          else{
            var orderLat = null;
            var orderLng = null;
          }
          var delayedDate = "";
          if(this.isDelayed){
            delayedDate += this.shippingDay.split('T')[0];
            delayedDate += ' ';
            delayedDate += (this.shippingHour.split('T')[1]).split('.')[0];
          }
          var allData = {lat: orderLat, lng: orderLng, shipping_date: delayedDate, user_id : localStorage.getItem('user_id'),quartier_id : localStorage.getItem('quartier_id'),line1 : this.data.quartier.quartier,line2 : this.indications,remarques : this.remarques,cart_no : localStorage.getItem('cart_no'), voucher: this.promo}

          this.server.order(allData).subscribe((response:any) => {

            if(response.msg == "done"){
              this.server.emptyCart(localStorage.getItem('cart_no')).subscribe((response:any) => {
                if(response.data){
                  localStorage.setItem('after_order', "1");
                  if(localStorage.getItem('remarques')){
                    localStorage.removeItem('remarques');
                  }
                  this.nav.navigateRoot('/order');
                }
                loading.dismiss();
              });
            }
            else{
              alert(response.error);
              this.isDisabled = 0;
              loading.dismiss();
            }

          }, (error:any) => {
            loading.dismiss();
            this.leaveOnError();
          });
        }
      });
    }
  }

  async emptyIndications(){
    const alert = await this.alertController.create({
      header: 'Attention !',
      message: 'Veuillez saisir votre adresse dans les indications pour pouvoir valider la commande.',
      buttons: [
        {
          text: 'Ok',
          handler: () => {
          }
        }
      ]
    });

    await alert.present();
  }

  async leaveOnError(){
    const alert = await this.alertController.create({
      header: 'Une erreur s\'est produite...',
      message: 'Une erreur est survenue lors de l\'enregistrement de votre commande. Nous vous prions de bien vouloir nous excuser pour la gêne occasionnée et vous invitons à réessayer.',
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.server.emptyCart(localStorage.getItem('cart_no')).subscribe((response:any) => {
              if(response.data){
                this.presentToast("Panier vidé", 'warning');
                this.nav.navigateRoot('/home');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async saveAddress()
  {
    const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
    });
    await loading.present();

    this.server.updateAddressCheckout(this.quartier, this.indications,localStorage.getItem('user_id')).subscribe((response:any) => {

    if(response.msg == 'done')
    {
      this.presentToast("Adresse mise à jour", 'secondary');
    }
    else
    {
      this.presentToast(response.error, 'danger');
    }

    loading.dismiss();

    });
  }

  payPaypal()
  { 


        this.payPal.init({
        PayPalEnvironmentProduction: this.paypal_id,
        PayPalEnvironmentSandbox: this.paypal_id
      }).then(() => {
        // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
        this.payPal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
          // Only needed if you get an "Internal Service Error" after PayPal login!
          //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
        })).then(() => {
          let payment = new PayPalPayment(this.total_amount, 'USD', 'Description', 'sale');
          this.payPal.renderSinglePaymentUI(payment).then((res) => {
            
            this.payment_id = res.response.id;

            if(this.payment_id)
            {
              this.order();
            }

          }, () => {
            
            this.presentToast("Paypal Transaction Cancelled");

          });
        }, () => {

          this.presentToast("Error in configuration");

        });
      }, () => {
        // 

          this.presentToast("Error in initialization, maybe PayPal isn't supported");

      });
  }


 async presentToast(txt, clr='dark') {
    const toast = await this.toastController.create({
      message: txt,
      duration: 2000,
      position : 'bottom',
      color: clr
    });
    toast.present();
  }

  quartierChanged(event)
  {
    this.quartier = event.detail.value;

    localStorage.setItem('quartier', event.detail.value);

  }

  dateChanged(){
    this.data.ion_picker_values.days.forEach((item, index) => {
      if(item == this.shippingDay.split('T')[0]){
        this.hoursValues = this.data.ion_picker_values.hours[index];
      }
    });
  }

setUIBackButtonAction() {
  this.backButton.onClick = () => {
    console.log('checkout press button');
    if(this.canBack){
      console.log('checkout can press button');
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
