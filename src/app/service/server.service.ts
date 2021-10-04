import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  
  //put /api/ after your url e.g https://www.abc.com/api/
  url = "/api/";

  constructor(private http: HttpClient) { }

  welcome()
  {
  	return this.http.get(this.url+'slides  ')
  	    	   .pipe(map(results => results));
  }

  city()
  {
    return this.http.get(this.url+'city?lid='+localStorage.getItem('lid'))
             .pipe(map(results => results));
  }

  location()
  {
    return this.http.get(this.url+'location?lid='+localStorage.getItem('lid'))
             .pipe(map(results => results));
  }

  lang()
  {
    return this.http.get(this.url+'lang')
             .pipe(map(results => results));
  }

  homepage(city_id)
  {
    return this.http.get(this.url+'homepage/'+city_id)
             .pipe(map(results => results));
  }

  storespage(quartier_id, category_id)
  {
    return this.http.get(this.url+'storespage/'+quartier_id+'/'+category_id)
             .pipe(map(results => results));
  }

  blogpage(lang_id)
  {
    return this.http.get(this.url+'blogpage'+lang_id)
             .pipe(map(results => results));
  }

  storepage(quartier_id, category_id, cartNo)
  {
    return this.http.get(this.url+'storepage/'+quartier_id+'/'+category_id+'/'+cartNo)
             .pipe(map(results => results));
  }

  promospage(quartier_id, category_id, cartNo)
  {
    return this.http.get(this.url+'promospage/'+quartier_id+'/'+category_id+'/'+cartNo)
             .pipe(map(results => results));
  }

  getQuartier(quartier_id)
  {
    return this.http.get(this.url+'quartier/'+quartier_id)
             .pipe(map(results => results));
  }

  articlepage(article_id)
  {
    return this.http.get(this.url+'articlepage/'+article_id)
             .pipe(map(results => results));
  }

  search(quartier_id, q, category_id = "")
  {
    return this.http.get(this.url+'search/'+quartier_id+'/'+q+'/'+category_id)
             .pipe(map(results => results));
  }

  isLastCategory(category_id)
  {
    return this.http.get(this.url+'isLastCategory/'+category_id)
             .pipe(map(results => results));
  }

  addToCart(data)
  {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const options = {
      headers: headers
    };
    return this.http.post(this.url+'addToCart',data,options)
             .pipe(map(results => results));
  }

  updateCart(id,type)
  {
    return this.http.get(this.url+'updateCart/'+id+'/'+type)
             .pipe(map(results => results));
  }

  cartCount(cartNo)
  {
    return this.http.get(this.url+'cartCount/'+cartNo)
             .pipe(map(results => results));
  }

  getCart(cartNo, quartierId)
  {
    return this.http.get(this.url+'getCart/'+cartNo+'/'+quartierId)
             .pipe(map(results => results));
  }

  getCartView(cartNo)
  {
    return this.http.get(this.url+'getCartView/'+cartNo)
             .pipe(map(results => results));
  }

  emptyCart(cartNo)
  {
    return this.http.get(this.url+'emptyCart/'+cartNo)
             .pipe(map(results => results));
  }

  getOffer(cartNo)
  {
    return this.http.get(this.url+'getOffer/'+cartNo)
             .pipe(map(results => results));
  }

  applyCoupen(code,cartNo,quartierID)
  {
    return this.http.get(this.url+'applyCoupen/'+code+'/'+cartNo+'/'+quartierID)
             .pipe(map(results => results));
  }

  signup(data)
  {
    return this.http.post(this.url+'signup',data)
             .pipe(map(results => results));
  }

  sendMessage(data)
  {
    return this.http.post(this.url+'sendMessage',data)
             .pipe(map(results => results));
  }

  login(data)
  {
    return this.http.post(this.url+'login',data)
             .pipe(map(results => results));
  }

  forgot(data)
  {
    return this.http.post(this.url+'forgot',data)
             .pipe(map(results => results));
  }

  verify(data)
  {
    return this.http.post(this.url+'verify',data)
             .pipe(map(results => results));
  }

  updatePassword(data)
  {
    return this.http.post(this.url+'updatePassword',data)
             .pipe(map(results => results));
  }

  getAddress(id)
  {
    return this.http.get(this.url+'getAddress/'+id)
             .pipe(map(results => results));
  }

  getCategory(id)
  {
    return this.http.get(this.url+'getCategory/'+id)
             .pipe(map(results => results));
  }

  lastAddressByUserID(id)
  {
    return this.http.get(this.url+'getLastAddress/'+id)
             .pipe(map(results => results));
  }

  myOrder(id)
  {
    return this.http.get(this.url+'myOrder/'+id)
             .pipe(map(results => results));
  }

  getsingleorder(id)
  {
    return this.http.get(this.url+'getsingleorder/'+id)
             .pipe(map(results => results));
  }

  getproductvariants(pid)
  {
    return this.http.get(this.url+'getproductvariants/'+pid)
             .pipe(map(results => results));
  }

  getadminsingleorder(id, user_id)
  {
    return this.http.get(this.url+'getadminsingleorder/'+id+'/'+user_id)
             .pipe(map(results => results));
  }

  myBillerOrder(id, history)
  {
    return this.http.get(this.url+'myBillerOrder/'+id+'/'+history)
             .pipe(map(results => results));
  }

  saveAddress(data)
  {
    return this.http.post(this.url+'addAddress',data)
             .pipe(map(results => results));
  }

  providerLogin(data, provider)
  {
    return this.http.post(this.url+'providerLogin/'+provider,data)
             .pipe(map(results => results));
  }

  order(data)
  {
    return this.http.post(this.url+'order',data)
             .pipe(map(results => results));
  }

  userInfo(id)
  {
    return this.http.get(this.url+'userinfo/'+id)
             .pipe(map(results => results));
  }

  billerInfo(id)
  {
    return this.http.get(this.url+'billerinfo/'+id)
             .pipe(map(results => results));
  }

  billerUserInfo(id)
  {
    return this.http.get(this.url+'billeruserinfo/'+id)
             .pipe(map(results => results));
  }

  userIDByEmail(email)
  {
    return this.http.post(this.url+'useridbyemail',email)
             .pipe(map(results => results));
  }

  updateInfo(data,id)
  {
    return this.http.post(this.url+'updateInfo/'+id,data)
             .pipe(map(results => results));
  }

  updateAddress(data,id)
  {
    return this.http.post(this.url+'updateAddress/'+id,data)
             .pipe(map(results => results));
  }

  updateAddressCheckout(quartier,indications,id)
  {
    return this.http.post(this.url+'updateAddress/'+id, {'quartier': quartier, 'indications': indications})
             .pipe(map(results => results));
  }

  cancelOrder(id,uid,note='')
  {
    return this.http.get(this.url+'cancelOrder/'+id+'/'+uid+'/'+note)
             .pipe(map(results => results));
  }

  updateOrderStatus(id,uid,status)
  {
    return this.http.get(this.url+'updateOrderStatus/'+id+'/'+uid+'/'+status)
             .pipe(map(results => results));
  }

  billerOpening(id,open)
  {
    return this.http.get(this.url+'billerOpening/'+id+'/'+open)
             .pipe(map(results => results));
  }

  loginFb(data)
  {
    return this.http.post(this.url+'loginFb',data)
             .pipe(map(results => results));
  }

  sendChat(data)
  {
    return this.http.post(this.url+'sendChat',data)
             .pipe(map(results => results));
  }

  push()
  {
    return this.http.get(this.url+'push')
             .pipe(map(results => results));
  }

  rating(data)
  {
    return this.http.post(this.url+'rate',data)
             .pipe(map(results => results));
  }

  updateCity(data)
  {
    return this.http.post(this.url+'rate',data)
             .pipe(map(results => results));
  }

  pages()
  {
    return this.http.get(this.url+'pages?lid='+localStorage.getItem('lid')).pipe(
      map(results => results)
    );
  }
}
