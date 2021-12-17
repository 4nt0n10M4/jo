import CommandCall from "./CommandCall";

class CommandCallDbHelper {
    constructor(call: CommandCall){
        this.call = call;
    }

    public call: CommandCall;

    async guild(){
        let r = await this.call.client.database.guild.findFirst({where: {id: this.call.member.guild.id}});
        if(r == null) r = await this.call.client.database.guild.create({data: {id: this.call.member.guild.id}});
        return r;
    }

    async user(){
        let r = await this.call.client.database.user.findFirst({where: {id: this.call.member.id}});
        if(r == null) r = await this.call.client.database.user.create({data: {id: this.call.member.id}});
        return r;
    }
}

export default CommandCallDbHelper;