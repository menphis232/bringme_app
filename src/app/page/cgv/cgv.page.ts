import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerService } from '../../service/server.service';
import { ToastController,NavController,Platform,LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-cgv',
  templateUrl: './cgv.page.html',
  styleUrls: ['./cgv.page.scss'],
})

export class CgvPage implements OnInit {

  data:any;
  text:any;
  constructor(private route: ActivatedRoute,public server : ServerService,public toastController: ToastController,private nav: NavController,public loadingController: LoadingController){

    this.text = JSON.parse(localStorage.getItem('app_text'));


  }

  ngOnInit()
  {
  	this.loadData();
  }

  async loadData()
  {
  	const loading = await this.loadingController.create({
      message: 'Merci de patienter...',
      duration: 3000
    });
    await loading.present();

  	loading.dismiss();
  }
}
