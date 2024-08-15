export class cart_detail {
    cart_id: string;
    product_id: string;
    price: number;
    quantity: number

    public constructor(cart_id: string, product_id: string, price: number, quantity: number) {
        this.cart_id = cart_id;
        this.product_id = product_id;
        this.price = price;
        this.quantity = quantity;
    }
}