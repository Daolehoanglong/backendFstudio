export class product {
    id: string;
    name: string;
    image: string;
    price: number;
    catalogid: string

    public constructor(id: string, name: string, price: number, image: string = '', catalogid: string) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.price = price;
        this.catalogid =catalogid;
    }
}