import { Component, OnInit,ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerService } from '../../service/server.service';
import { AlertController,ToastController,NavController,Platform,LoadingController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})

export class ProfilePage implements OnInit {
@ViewChild('content',{static:false}) private content: any;

data:any;
user:any;
biller:any;
action:any;
text:any;

  constructor(private fireAuth: AngularFireAuth,private route: ActivatedRoute,public server : ServerService,public alertController: AlertController,public toastController: ToastController,private nav: NavController,public loadingController: LoadingController){

    this.text = JSON.parse(localStorage.getItem('app_text'));
  
  }

  ngOnInit()
  {
  }

  ionViewWillEnter()
  {
    console.log('profile enter');
    if(!localStorage.getItem('user_id') || localStorage.getItem('user_id') == 'null')
    {
      console.log('no user_id');
      this.fireAuth.auth.onAuthStateChanged(user => {
        if (user) {
          this.server.userIDByEmail(user.email).subscribe((response:any) => {
            localStorage.setItem('user_id', response.data);
            this.loadData();
          });
        }
        else {
          this.nav.navigateBack('/login');
        }
      })
    }
    else
    {
      console.log('user_id');
      this.loadData();
    }
  }

  async takeAction(type)
  {
    if(this.action == type){
      this.action = 0;
    }
    else{
      this.action = type;
    }
  }

  async loadData()
  {
    const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
    });
    await loading.present();

    this.server.billerUserInfo(localStorage.getItem('user_id')).subscribe((response:any) => {
  
    this.user = response.data.user;
    this.biller = response.data.biller;

    loading.dismiss();

    });
  }

  async update(data)
  {
    const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
    });
    await loading.present();

    this.server.updateInfo(data,localStorage.getItem('user_id')).subscribe((response:any) => {

    if(response.msg == 'done')
    {
    	this.action = 0;
    	this.user = response.data;

    	this.presentToast("Informations mises à jour", 'secondary');
    }
    else
    {
    	this.presentToast(response.error, 'danger');
    }

    loading.dismiss();

    });
  }

  async presentToast(txt, clr='dark') {
    const toast = await this.toastController.create({
      message: txt,
      duration: 3000,
      position : 'bottom',
      mode:'ios',
      color:clr
    });
    toast.present();
  }

  logout()
  {
    this.fireAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.fireAuth.auth.signOut().then(() => {
          localStorage.setItem('user_id',null);
          this.nav.navigateRoot('/home');
        })
      }
      else {
        localStorage.setItem('user_id',null);
        this.nav.navigateRoot('/home');
      }
    })
  }

  async modalOnLogout(){
    const alert = await this.alertController.create({
      header: 'Attention !',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: 'Se déconnecter',
          handler: () => {
            this.logout();
          }
        }
      ]
    });

    await alert.present();
  }

  async closeStore()
  {
    const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
    });
    await loading.present();

    this.server.billerOpening(this.biller.id, 0).subscribe((response:any) => {
  
    this.data = response.data;
    this.biller.open = 0;

    this.presentToast("Boutique fermée.", 'secondary');

    loading.dismiss();

    });
  }

  async openStore()
  {
    const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
    });
    await loading.present();

    this.server.billerOpening(this.biller.id, 1).subscribe((response:any) => {
  
    this.data = response.data;
    this.biller.open = 1;

    this.presentToast("Boutique ouverte.", 'secondary');

    loading.dismiss();

    });
  }

  ordersHistory(){
    localStorage.setItem('history', "1");
    this.nav.navigateForward('/admin-order');
  }

  orders(){
    localStorage.removeItem('history');
    this.nav.navigateForward('/admin-order');
  }
}
