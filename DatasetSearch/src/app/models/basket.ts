import {Expose} from 'class-transformer';
// for saving the basket by the user
export class Basket {
    @Expose({ name: 'userid' })
    private userId: string;
    @Expose({ name: 'basketid' })
    private basketId: string;
    @Expose({ name: 'content' })
    private content: JSON;

    static from(json): Basket {
        return Object.assign(new Basket(), json);
    }

    getContent(): JSON {
        return this.content;
    }

    setContent(content: JSON): void {
        this.content = content;
    }

    getUserId(): string {
        return this.userId;
    }

    setUserId(userId: string): void {
        this.userId = userId;
    }

    getBasketId(): string {
      return this.basketId;
  }

  setBasketId(basketId: string): void {
      this.basketId = basketId;
  }
}
