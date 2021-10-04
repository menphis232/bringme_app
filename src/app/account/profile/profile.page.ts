import { Component, OnInit,ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerService } from '../../service/server.service';
import { ChangeDetectorRef } from '@angular/core';
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
quartiers:any;
quartier:any;
address:any;
action:any;
text:any;

  constructor(private fireAuth: AngularFireAuth,public cdr: ChangeDetectorRef,private route: ActivatedRoute,public server : ServerService,public alertController: AlertController,public toastController: ToastController,private nav: NavController,public loadingController: LoadingController){

    this.text = JSON.parse(localStorage.getItem('app_text'));
  
  }

  ngOnInit()
  {
  }

  ionViewWillEnter()
  {
    if(!localStorage.getItem('user_id') || localStorage.getItem('user_id') == 'null')
    {
      this.nav.navigateBack('/login');
    }
    else
    {
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

    this.server.userInfo(localStorage.getItem('user_id')).subscribe((response:any) => {

    this.user = response.data;
    this.address = response.address;
    this.quartier = response.address.quartier_details;
    console.log(response.address.quartier_details);
    this.quartiers = response.quartiers;
    // if(!this.address){
    //   this.address = {"quartier": {"id": localStorage.getItem('quartier_id')}, "indications": ""};
    //   this.quartiers.forEach((item, index) => {
    //     if(item.id == this.address.quartier.id){
    //       this.address.quartier = item;
    //     }
    //   });
    // }
    if(this.user.biller_id){
      this.nav.navigateForward('admin-profile');
    }

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

  async updateA(data)
  {
    const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
    });
    await loading.present();

    this.server.updateAddress(data,localStorage.getItem('user_id')).subscribe((response:any) => {

    if(response.msg == 'done')
    {
      this.action = 0;
      this.user = response.data;

      if(localStorage.getItem('quartier_id') != data.quartier){
        if(localStorage.getItem('position')){
          localStorage.removeItem('position');
        }
        this.quartierChanged();
      }

      localStorage.setItem('quartier_id', data.quartier);

      this.presentToast("Adresse mise à jour", 'secondary');
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

  consoleQuartier(){
    console.log(this.address.quartier_details);
  }

  logout()
  {
    localStorage.setItem('user_id',null);
    this.nav.navigateRoot('/home');
    this.fireAuth.auth.signOut();
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

  async quartierChanged(){
    const alert = await this.alertController.create({
      header: 'Attention !',
      message: 'Vous avez changé de quartier. Merci de bien vouloir actualiser votre position.',
      buttons: [
        {
          text: 'Ok',
          handler: (blah) => {
          }
        }
      ]
    });

    await alert.present();
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
}
