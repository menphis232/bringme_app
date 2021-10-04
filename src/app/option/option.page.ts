import { Component, OnInit, ViewChild } from '@angular/core';
import { NavParams,IonContent } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { ServerService } from '../service/server.service';


@Component({
  selector: 'app-option',
  templateUrl: './option.page.html',
  styleUrls: ['./option.page.scss'],
})
export class OptionPage implements OnInit {
  
  @ViewChild(IonContent, {static: false}) content: IonContent;
  item:any;
  currency:any;
  index:any;
  biller:any;
  category:any;
  itemID:any;
  enabled:any = false;
  quantity:any = 1;
  itemPrice:any;
  note:any;
  count:any;
  addonData:any = [];
  variants = [];
  selectedOptions = new Object();
  checkedOptions = [];
  final_price:any;
  final_price_str:any;
  text:any;
  constructor(public navParams: NavParams,public platform: Platform,public toastController: ToastController,public server : ServerService,public modalController: ModalController) {

  this.item 	= navParams.get('item');
  this.quantity = 1;
  this.currency = navParams.get('currency');
  this.index = navParams.get('index');
  this.category = navParams.get('category');
  this.text = JSON.parse(localStorage.getItem('app_text'));


  }

  ngOnInit() {

    this.final_price = this.item.promo ? parseInt(this.item.promo_price) : this.item.price;
    this.final_price_str = this.final_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    this.server.getproductvariants(this.item.id).subscribe((response:any) => {
      this.variants = response.data;
      this.server.billerInfo(this.item.biller_id).subscribe((response:any) => {
        this.biller = response.data;
        this.enabled = true;
      });
    });
    this.setUIBackButtonAction();
  }

  // async addToCart()
  // {
  //   await this.modalController.dismiss({id:this.item.id,price:this.itemPrice,type:this.itemID,qty:this.quantity,index:this.index});
  // }

  async decreaseQty()
  {
    if(this.quantity > 1){
      this.quantity--;
    }
  }

  async increaseQty()
  {
    if((this.quantity + parseInt(this.item.cart_qty)) < this.item.quantity || !this.item.track_quantity){
      this.quantity++;
    }
    else{
      this.presentToast('Limite de stock atteinte...', 'warning');
    }
  }

  async closeModal() {
    
    await this.modalController.dismiss({count:this.count,quantity:this.quantity});
  }

  selectItem(type,price)
  {
    this.itemID     = type;
    this.itemPrice  = price;
  }

  addonSelect(id)
  {

    if(this.addonData.includes(id))
    {
      var ind = this.addonData.indexOf(id);

      this.addonData.splice(ind,1);
    }
    else
    {
      this.addonData.push(id);
    }
  }



  addToCart(product,price,type = 0,qty = 1,note = "")
  {
    if(this.enabled){
      this.enabled = false;
      if(this.variants != []){
        var BreakException = {};
        try{
          this.variants.forEach((elt, idx) => {
            if(elt.min >= 1){
              if(typeof this.selectedOptions[elt.name] == 'undefined' || this.selectedOptions[elt.name].length < elt.min){
                this.presentToast('Merci de bien vouloir choisir les options requises.', 'warning');
                this.enabled = true;
                var a:any = document.getElementById(elt.name), c = 0;
                while (a) {
                  c += a.offsetTop;
                  a = a.offsetParent;
                }
                this.content.scrollToPoint(0, (c-80), 500);
                document.getElementById(elt.name).style.backgroundColor = "rgba(255,0,0,0.5)";
                setTimeout(() => {document.getElementById(elt.name).style.backgroundColor = "rgba(255,255,255,1)";}, 1000);
                throw BreakException;
                return;
              }
            }
          });
        }
        catch (e){
          if (e !== BreakException) throw e;
        }
      }
      if(!this.enabled){
        if((this.quantity + parseInt(this.item.cart_qty)) <= this.item.quantity || type == 1 || !product.track_quantity){
         var allData = {
           "cart_no" : localStorage.getItem('cart_no'),
           "id" : product.id,
           "price" : price,
           "qty" : this.quantity,
           "type" : type,
           "qtype" : 0,
           "note" : note,
           "variants" : this.selectedOptions
         };

         this.server.addToCart(allData).subscribe((response:any) => {

          this.count = response.data.count;
          this.presentToast(response.data.msg, 'secondary');
          this.closeModal();

         });
        }
        else{
          this.presentToast('Limite de stock atteinte...', 'warning');
          this.enabled = true;
        }
      }
    }
  }

  selectOption($event, variant_name, option_id, price, variant_min, variant_max){
    $event.preventDefault();
    $event.stopPropagation();
    if (typeof this.selectedOptions[variant_name] == 'undefined') {
      this.selectedOptions[variant_name] = [];
    }
    if(this.selectedOptions[variant_name].includes(option_id)){
      var idx = this.selectedOptions[variant_name].indexOf(option_id);
      this.selectedOptions[variant_name].splice(idx,1);
      var idex = this.checkedOptions.indexOf(option_id);
      this.checkedOptions.splice(idex,1);
      this.final_price -= parseInt(price);
      this.final_price_str = this.final_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      return true;
    }
    else{
      if($event.detail.checked){
        console.log(variant_max);
        console.log(this.selectedOptions[variant_name].length);
        if(this.selectedOptions[variant_name].length < variant_max){
          this.selectedOptions[variant_name].push(option_id);
          this.checkedOptions.push(option_id);
          this.final_price += parseInt(price);
          this.final_price_str = this.final_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        }
        else{
          if(variant_min == 1 && variant_max == 1){
            this.final_price -= parseInt(document.getElementById(variant_name+this.selectedOptions[variant_name][0]).dataset.price);
            this.selectedOptions[variant_name] = [];
            this.checkedOptions = [];
            this.selectedOptions[variant_name].push(option_id);
            this.checkedOptions.push(option_id);
            this.final_price += parseInt(price);
            this.final_price_str = this.final_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
          }
          else{
            $event.target.checked = false;
          }
        }
      }
    }
  }

  async presentToast(txt, clr='dark') {
    const toast = await this.toastController.create({
      message: txt,
      duration: 1500,
      color: clr,
      position: 'top'
    });
    toast.present();
  }

  setUIBackButtonAction() {
    this.platform.backButton.subscribeWithPriority(2, () => {
      this.closeModal();
    });
  } 
}
