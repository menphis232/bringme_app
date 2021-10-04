import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsMapTypeId,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Poly,
  ILatLng,
  Marker,
  Environment
} from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Globals } from '../app.globals';
import { ServerService } from '../service/server.service';
import { ToastController,Platform,LoadingController,NavController } from '@ionic/angular';
import { IonContent } from '@ionic/angular';

declare var google;

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})

export class LocationPage implements OnInit {

  @ViewChild('map_canvas',{static:false}) mapElement: ElementRef;
  @ViewChild(IonContent, {static: false}) content: IonContent;
  map: any;
  chosen:any = 0;
  marker: any;
  globals: Globals;
  text:any;
  data:any;
  lat:any;
  lng:any;
  detected:any;
  changing:any = 0;
  polygons:any = [];
  quartier:any = 0;
  quartierID:any;
  quartierVisible:any = 1;
  quartierName:any = "Jalandhar";
  heading:string = 'Merci de bien vouloir vous localiser avant de pouvoir continuer.';
  constructor(public geolocation: Geolocation,private cd: ChangeDetectorRef,globals: Globals,private platform: Platform,public server : ServerService,public toastController: ToastController,public loadingController: LoadingController,private nav: NavController)
  {

    /*if(localStorage.getItem('user_id') && localStorage.getItem('user_id') != 'null')
    {
      this.server.lastAddressByUserID(localStorage.getItem('user_id')).subscribe((response:any) => {

        

      });
    }
    if(localStorage.getItem('quartier_id'))
    {
      this.quartierID = localStorage.getItem('quartier_id');
      this.quartierName = localStorage.getItem('quartier_name');
      this.heading = "Vous souhaitez changer d'adresse? Selectionnez & continuez.";
    }*/

    this.text = JSON.parse(localStorage.getItem('app_text'));
  }

  ngOnInit()
  {
    this.platform.ready().then(() => {
      setTimeout(() => {
        this.initMap();
      }, 1000);
      setTimeout(() => {
        this.loadData();
      }, 2000);
    });
  }

  ionViewDidEnter()
  {
    setTimeout(() => {this.content.scrollToPoint(0, 160, 500);}, 800);
  }

  initMap() {
    var latLng = new google.maps.LatLng(14.693485, -17.473517);
    this.map = new google.maps.Map(this.mapElement.nativeElement);
    var mapOptions = {
      center: latLng,
      zoom: 14,
      controls: {
        'myLocationButton': true,
        'myLocation': true
      },
      styles: [
        {
          "featureType": "all",
          "stylers": [
            { "visiblity": "hidden" }
          ]
        }
      ],
      disableDefaultUI: true
    };
    this.map.setOptions(mapOptions);
    if(localStorage.getItem('chosen_lat') && localStorage.getItem('chosen_lng') && parseFloat(localStorage.getItem('chosen_lat')) > 13 && parseFloat(localStorage.getItem('chosen_lng')) < -16){
      latLng = new google.maps.LatLng(parseFloat(localStorage.getItem('chosen_lat')), parseFloat(localStorage.getItem('chosen_lng')));
      mapOptions = {
        center: latLng,
        zoom: 16,
        controls: {
          'myLocationButton': true,
          'myLocation': true
        },
        styles: [
          {
            "featureType": "all",
            "stylers": [
              { "visiblity": "hidden" }
            ]
          }
        ],
        disableDefaultUI: true
      };
      this.chosen = 1;
    }
    this.map.setOptions(mapOptions);
    this.geolocation.getCurrentPosition().then((resp) => {
      var geoLatitude = resp.coords.latitude;
      var geoLongitude = resp.coords.longitude; 

      this.marker = new google.maps.Marker({
        position: {lat:geoLatitude, lng:geoLongitude},
        map: this.map,
        title: 'Ma position',
        icon: 'assets/my_location.png'
      });
    }).catch((error) => {
      this.presentToast('Merci de bien vouloir activer la localisation de votre smartphone.', 'danger');
    });
    this.map.addListener('dragend', () => {
      this.waitActuQuartier().then(() => {
        if(!this.detected){
          this.presentToastMiddle('Hors zone de livraison...', 'danger');
          this.quartier = 0;
          this.cd.detectChanges();
        }
      });
    });
  }

  async waitActuQuartier(){
    return this.actuQuartier();
  }

  async actuQuartier(){
    let pos = this.map.getCenter();
    let finish = 0;
    this.detected = 0;
    this.polygons.forEach((item, idx) => {
      if(item){
        if(google.maps.geometry.poly.containsLocation(pos,item)){
          this.changing = 1;
          this.detected = 1;
          this.cd.detectChanges();
          this.quartier = ""+idx;
          this.quartierVisible = 0;
          setTimeout(() => {this.quartierVisible = 1;}, 100);
        }
      }
      if(idx = this.polygons.length - 1){
        finish = 1;
      }
    });
    return new Promise((resolve, reject) => {
      if(finish){
        resolve('finish');
      }
      else{
        reject('not finish');
      }
    });
  }

  async loadData()
  {
  	const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
      mode: 'ios'
    });
    await loading.present();

  	this.server.location().subscribe((response:any) => {
	
      this.data = response.data;
  	  this.text = response.text;

      this.data.forEach((item, index) => {
        if(item.polygon != "" && item.polygon){
          this.polygons[item.id] = new google.maps.Polygon({
            paths: JSON.parse(item.polygon),
            strokeColor: 'rgba(0,0,0,0)',
            strokeOpacity: 0,
            strokeWeight: 0,
            fillColor: 'rgba(0,0,0,0)',
            fillOpacity: 0
          });
          this.polygons[item.id].setMap(this.map);
        }
        else{
          this.polygons[item.id] = false;
        }
      });
      if(localStorage.getItem('quartier_id')){
        this.changing = 1;
        this.quartier = localStorage.getItem('quartier_id');
      }
      else{
        this.actuQuartier();
      }

  	  loading.dismiss();

  	});
  }

  async locateMe()
  {
    const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
      mode: 'ios'
    });
    await loading.present();
    this.geolocation.getCurrentPosition().then((resp) => {
      var geoLatitude = resp.coords.latitude;
      var geoLongitude = resp.coords.longitude; 
      
      localStorage.setItem('current_lat',""+geoLatitude);
      localStorage.setItem('current_lng',""+geoLongitude);
      this.map.setCenter({lat:geoLatitude, lng:geoLongitude});

      this.marker = new google.maps.Marker({
        position: {lat:geoLatitude, lng:geoLongitude},
        map: this.map,
        title: 'Ma position',
        icon: 'assets/my_location.png'
      });

      this.waitActuQuartier().then(() => {
        if(!this.detected){
          this.presentToastMiddle('Hors zone de livraison...', 'danger');
          this.quartier = 0;
        }
      });

      loading.dismiss();

    }).catch((error) => {
      loading.dismiss();
      this.presentToast('Merci de bien vouloir activer la localisation de votre smartphone.', 'danger');
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

   async presentToastMiddle(txt, clr='dark') {
    const toast = await this.toastController.create({
      message: txt,
      duration: 2000,
      position : 'middle',
      color: clr
    });
    toast.present();
  }

  search(ev) {
   
    // set val to the value of the ev target
    var val = ev.target.value;

    if(val && val.length > 0)
    {
        if (val && val.trim() != '') {
        this.data = this.data.filter((item) => {
        return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }
    }
    else
    {
        return this.loadData();
    }
  }

  setQuartier(id,name)
  {
    localStorage.setItem('quartier_id',id);
    localStorage.setItem('quartier_name',name);

    this.presentToast('Quartier mis à jour.', 'secondary');

    this.nav.navigateRoot('/home');
  }

  quartierChanged(){
    if(!this.chosen){
      if(this.polygons[this.quartier]){
        var bounds = new google.maps.LatLngBounds();
        this.polygons[this.quartier].getPath().forEach( (path, index) => {
            bounds.extend(path);
        });
        this.map.fitBounds(bounds);
        this.map.setOptions({zoom: 16});
      }
    }
    else{
      this.chosen = 0;
    }
  }

  async quartierSubmit()
  {
    if(this.quartier)
  	{
      this.server.getQuartier(this.quartier).subscribe((response:any) => {
        localStorage.setItem('quartier_id',response.quartier.id);
        localStorage.setItem('quartier_name',response.quartier.quartier);

        let pos = this.map.getCenter();
        console.log(pos);

        localStorage.setItem('chosen_lat',pos.lat().toString());
        localStorage.setItem('chosen_lng',pos.lng().toString());

        this.presentToast('Quartier mis à jour.', 'secondary');

        this.nav.navigateRoot('/home');
      });
  	}
  	else
  	{
		this.presentToast('Merci de selectionner un quartier pour pouvoir continuer.', 'danger');
  	}
  }
}
