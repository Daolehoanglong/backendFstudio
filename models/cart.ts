export class cart {
    username: string;
    address: string;
    phone: string;
    total: number

    public constructor(username: string, address: string, phone: string, total: number) {
        this.username = username;
        this.address = address;
        this.phone = phone;
        this.total = total;
    }
}