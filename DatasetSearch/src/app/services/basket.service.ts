import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'

export interface Basket {
    basketId: string,
    userId: string,
    content: JSON
}

@Injectable()
export class BasketService {
  constructor(private http: HttpClient) {}

  getBaskets(): Observable<Basket[]> {
    return this.http.get<Basket[]>('http://localhost:3000/api/baskets')
  }

  getBasket(basketId: string): Observable<Basket> {
    return this.http.get<Basket>('http://localhost:3000/api/baskets/' + basketId)
  }

  insertBasket(basket: Basket): Observable<Basket> {
    return this.http.post<Basket>('http://localhost:3000/api/baskets', basket)
  }

  updateBasket(basket: Basket): Observable<void> {
    return this.http.put<void>('http://localhost:3000/api/baskets/' + basket.basketId, basket)
  }

  deleteBasket(basketId: string) {
    return this.http.delete('http://localhost:3000/api/baskets/' + basketId)
  }

}