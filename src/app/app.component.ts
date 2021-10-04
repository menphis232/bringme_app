import { Component } from '@angular/core';

import { Platform,NavController,Events } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { ServerService } from './service/server.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  
  backButtonSub:any;
  appType:number = 0;
  dir:string = "ltr";
  text:any;
  quartier:any;
  public appPages:any = [];

  geoLatitude = null;
  geoLongitude=null;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private geolocation: Geolocation,
    public nav : NavController,
    private oneSignal: OneSignal,
    public events: Events,
    public server : ServerService
  ) {

     this.events.subscribe('lang_change', (type) => {
      
      this.assginAppType(type);

    });

     this.events.subscribe('text', (text) => {
      
      this.text = text;

    });

    if(localStorage.getItem('text'))
    {
      this.text = JSON.parse(localStorage.getItem('app_text'));

      var home:any      =  this.text.home;
      var city:any      = this.text.city;
      var lang:any      = this.text.language;
      var profile:any   = this.text.account;
      var order:any     = this.text.order;
    }
    else
    {
      this.text = {"menu_title":"Menu"};
      var home:any      = "Home";
      var city:any      = "Change City";
      var lang:any      = "Language";
      var profile:any   = "My Account";
      var order:any     = "My Orders";
    }

    if(localStorage.getItem('quartier_id'))
    {
      this.server.getQuartier(localStorage.getItem('quartier_id')).subscribe((response:any) => {

        this.quartier = response.quartier;

      });
    }
    
    if(localStorage.getItem('app_type'))
    {
      if(localStorage.getItem('app_type') == "1")
      {
        this.dir = "rtl";
      }
      else
      {
         this.dir = "ltr";
      }
      
    }

    localStorage.setItem('city_id', '0');

    if(localStorage.getItem('city_id') && localStorage.getItem('city_id') != 'null')
    {
      this.nav.navigateRoot('/home');
    }
    else
    {
      this.nav.navigateRoot('/welcome');
    }

    this.appPages = [
      {
        title: home,
        url: '/home',
        icon: 'home'
      },/*
      {
        title: city,
        url: '/city',
        icon: 'pin'
      },
      {
        title: lang,
        url: '/lang',
        icon: 'flag'
      },*/
      {
        title: profile,
        url: '/profile',
        icon: 'person'
      },
      {
        title: order,
        url: '/order',
        icon: 'cart'
      },

    ];

    this.initializeApp();

    this.events.subscribe('user_login', (id) => {

    this.subPush(id);

    });

  }

  assginAppType(ty)
  {
    this.dir = ty == 0 ? "ltr" : "rtl";
  }

  initializeApp() {

    this.platform.ready().then(() => {
      
      // this.getGeolocation();

      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.statusBar.overlaysWebView(false);
      this.statusBar.backgroundColorByHexString('#007F56');
      this.statusBar.styleLightContent();

      this.subPush();

    });

  }

  subPush(id = 0)
  {
      this.oneSignal.startInit('e31e68ec-423d-4f71-ac89-9662e906f295', '665736070770');

        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

        this.oneSignal.handleNotificationReceived().subscribe(() => {
         // do something when notification is received
        });

        this.oneSignal.handleNotificationOpened().subscribe((pushData) => {
          if(pushData.notification.payload.additionalData.custUrl){
            if(pushData.notification.payload.additionalData.custUrl == "/admin-order"){
              localStorage.setItem('history', null);
            }
            this.nav.navigateForward(pushData.notification.payload.additionalData.custUrl);
          }
        });

      if(localStorage.getItem('user_id') && localStorage.getItem('user_id') != 'null')
      {
          this.oneSignal.sendTags({user_id: localStorage.getItem('user_id')});
      }

      if(id > 0)
      {
          this.oneSignal.sendTags({user_id: id});
      }

      this.oneSignal.endInit();
  }

  getGeolocation(){
      
    this.geolocation.getCurrentPosition().then((resp) => {
      this.geoLatitude = resp.coords.latitude;
      this.geoLongitude = resp.coords.longitude; 
      //this.geoAccuracy = resp.coords.accuracy; 
      
     localStorage.setItem('current_lat',this.geoLatitude);
     localStorage.setItem('current_lng',this.geoLongitude);

     }).catch((error) => {
       


     });
  }
}
