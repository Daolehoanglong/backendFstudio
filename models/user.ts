export class user {
    username: string;
    pass : number;
    email: string;

    public constructor(username: string, pass:number, email:string) {
        this.username = username;
        this.pass = pass;
        this.email = email;
    }
}