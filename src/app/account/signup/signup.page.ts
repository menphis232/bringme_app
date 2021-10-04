import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerService } from '../../service/server.service';
import { ToastController,NavController,Platform,LoadingController,Events } from '@ionic/angular';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})

export class SignupPage implements OnInit {
  
  text:any;
  constructor(public events: Events,private route: ActivatedRoute,public server : ServerService,public toastController: ToastController,private nav: NavController,public loadingController: LoadingController){

   this.text = JSON.parse(localStorage.getItem('app_text'));

  }

  ngOnInit()
  {
  }

  async signup(data)
  {
    if(data.password != data.password_confirm){
      this.presentToast('Les deux mots de passe saisis ne correspondent pas.', 'warning')
    }
    else{
      const loading = await this.loadingController.create({
        message: 'Merci de patienter...',
      });
      await loading.present();

      this.server.signup(data).subscribe((response:any) => {
    
      if(response.msg == "error")
      {
        this.presentToast(response.error, 'danger');
      }
      else
      {
        localStorage.setItem('user_id',response.user_id);
        this.events.publish('user_login', response.user_id);
        this.presentToast("Votre compte a bien été créé !", 'secondary');
        this.nav.back();
      }

      loading.dismiss();

      });
    }
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
}
