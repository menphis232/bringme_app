import { Component, OnInit,ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IonBackButtonDelegate } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { ServerService } from '../../service/server.service';
import { ToastController,NavController,Platform,LoadingController,Events } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { SignInWithApple, AppleSignInResponse, AppleSignInErrorResponse, ASAuthorizationAppleIDRequest } from '@ionic-native/sign-in-with-apple/ngx';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {
  
  @ViewChild(IonBackButtonDelegate, { static: false }) backButton: IonBackButtonDelegate;
  email:any;
  password:any;
  text:any;
  loading:any;
  canBack = 1;
  
  constructor(public events: Events,private http: HttpClient,private platform: Platform,private google: GooglePlus,private fb: Facebook,private fireAuth: AngularFireAuth,private route: ActivatedRoute,public server : ServerService,public toastController: ToastController,private nav: NavController,public loadingController: LoadingController,private signInWithApple: SignInWithApple){

  this.text = JSON.parse(localStorage.getItem('app_text'));

  }

  ngOnInit()
  {
  }

  ionViewWillEnter()
  {
    this.setUIBackButtonAction();
    if(localStorage.getItem('user_id') && localStorage.getItem('user_id')!=null && localStorage.getItem('user_id')!="null"){
      this.nav.back();
    }
  }

  async login(data)
  {
    const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
    });
    await loading.present();

    this.server.login(data).subscribe((response:any) => {
    
      if(response.msg != "done")
      {
        loading.dismiss();
        this.presentToast(response.msg, 'secondary');
      }
      else
      {
        localStorage.setItem('user_id',response.user_id);
        this.events.publish('user_login', response.user_id);
        this.presentToast("Bienvenue !", 'secondary');
        this.nav.back();
      }

      loading.dismiss();

    });
  }


  async googleLogin() {
    const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
    });
    await loading.present();
    let params;
    params = {
      'webClientId': '665736070770-klavbhek3q6isc99us9nbcgccma7dogi.apps.googleusercontent.com',
      'offline': true
    }
    this.google.login(params)
    .then((response) => {
      const { idToken, accessToken } = response;
      this.googleOnLoginSuccess2(idToken, accessToken);
      loading.dismiss();
    }).catch((error) => {
      console.log(error);
      alert('error:' + JSON.stringify(error));
      loading.dismiss();
    });
  }
  googleOnLoginSuccess2(accessToken, accessSecret) {
    var resp = this.http.get("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token="+accessToken).pipe(map(results => results));

    resp.subscribe((res) => {
      this.server.providerLogin({profile: res}, 'Google').subscribe((response2:any) => {
        if(response2.msg != "done")
        {
          this.presentToast(response2.msg, 'warning');
        }
        else
        {
          if(response2.user_id){
            localStorage.setItem('user_id',response2.user_id);
            this.events.publish('user_login', response2.user_id);
            this.presentToast("Bienvenue !", 'secondary');
            this.nav.back();
          }
          else{
            this.presentToast("Une erreur s'est porduite. Merci de bien vouloir réessayer.", 'danger');
          }
        }

      });
    }, (error) => {
        alert(JSON.stringify(error));
    });
  }
  googleOnLoginError(err) {
    console.log(err);
  }


  async facebookLogin() {
    const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
    });
    await loading.present();

    this.fb.login(['email'])
      .then((response: FacebookLoginResponse) => {
        this.facebookOnLoginSuccess2(response);
        loading.dismiss();
      }).catch((error) => {
        console.log(error);
        alert('error:' + error);
        loading.dismiss();
      });
  }
  facebookOnLoginSuccess2(res: FacebookLoginResponse) {
    this.fb.api("/me?fields=name,email", ["public_profile", "email"])
      .then(user => {
        this.server.providerLogin({profile: user}, 'Facebook').subscribe((response2:any) => {
          if(response2.msg != "done")
          {
            this.presentToast(response2.msg, 'warning');
          }
          else
          {
            if(response2.user_id){
              localStorage.setItem('user_id',response2.user_id);
              this.events.publish('user_login', response2.user_id);
              this.presentToast("Bienvenue !", 'secondary');
              this.nav.back();
            }
            else{
              this.presentToast("Une erreur s'est porduite. Merci de bien vouloir réessayer.", 'danger');
            }
          }

        });
      });
  }
  facebookOnLoginError(err) {
    console.log(err);
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
      if(this.canBack){
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

  loginApple(){
    this.signInWithApple.signin({
      requestedScopes: [
        ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
        ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail
      ]
    })
    .then((res: AppleSignInResponse) => {
      // https://developer.apple.com/documentation/signinwithapplerestapi/verifying_a_user
      alert('Send token to apple for verification: ' + res.identityToken);
      console.log(res);
    })
    .catch((error: AppleSignInErrorResponse) => {
      alert(error.code + ' ' + error.localizedDescription);
      console.error(error);
    });
  }
}
