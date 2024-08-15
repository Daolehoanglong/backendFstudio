export class product {
    constructor(id, name, price, image = '', catalogid) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.price = price;
        this.catalogid = catalogid;
    }
}
