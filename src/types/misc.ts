import { Snowflake } from "discord.js/typings/index.js";
import { ChannelType } from "discord-api-types/v9";
type ArgChoice = [string, any]
interface Args {
    [key: string]: any
}

function capitalize(str: string) : string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function isOnSnowflakeRange(snowflake_str: Snowflake){
    try{
        let snowflake = BigInt(snowflake_str)
        return(snowflake>0 && snowflake<BigInt("9223372036854775807"));
    } catch(e){
        return false;
    }
}

function filterObject(obj: object, callback: (key: string, value: any) => boolean){
    return Object.fromEntries(
        Object.entries(obj).filter(
            ([key, val]) => callback(val, key)
        )
    );
}

let ChannelTypeNameToChannelType = {
    [ChannelType.GuildText]: "GUILD_TEXT",
    [ChannelType.DM]: "DM",
    [ChannelType.GuildVoice]: "GUILD_VOICE",
    [ChannelType.GroupDM]: "GROUP_DM",
    [ChannelType.GuildCategory]: "GUILD_CATEGORY",
    [ChannelType.GuildNews]: "GUILD_NEWS",
    [ChannelType.GuildStore]: "GUILD_STORE",
    [ChannelType.GuildNewsThread]: "GUILD_NEWS_THREAD",
    [ChannelType.GuildPublicThread]: "GUILD_PUBLIC_THREAD",
    [ChannelType.GuildPrivateThread]: "GUILD_PRIVATE_THREAD",
    [ChannelType.GuildStageVoice]: "GUILD_STAGE_VOICE"
}

let ChannelTypeForSlashCommandArgumentToChannelName = filterObject(ChannelTypeNameToChannelType, (type, name) => { return !['DM', 'GROUP_DM'].includes(name) });

type ChannelTypeForSlashCommandArgument = Exclude<ChannelType, ChannelType.DM | ChannelType.GroupDM>;

function toSnakeCase(str: string) {
    return str.split('').map((character) => {
        if (character == character.toUpperCase()) {
            return '_' + character.toLowerCase();
        } else {
            return character;
        }
    })
    .join('');
}

class CommandNotFoundError extends Error{
    constructor(message: string){
        super(message);
        this.name = 'CommandNotFoundError';
    }
}

class InvalidChannelTypeError extends Error{
    constructor(message: string){
        super(message);
        this.name = 'InvalidChannelTypeError';
    }
}

class InvalidChoiceError extends Error{
    constructor(message: string, choices: ArgChoice[]){
        super(message);
        this.name = 'InvalidChoiceError';
        this.choices = choices;
    }

    public choices: ArgChoice[];

    toString(){
        return `${this.name}: ${this.message}\nAvailable choices: ${this.choices.map(choice => choice[0]).join(', ')}.`;
    }
}

let Currencies = {
    "ada": "Cardano",
    "aed": "United Arab Emirates Dirham",
    "afn": "Afghan afghani",
    "all": "Albanian lek",
    "amd": "Armenian dram",
    "ang": "Netherlands Antillean Guilder",
    "aoa": "Angolan kwanza",
    "ars": "Argentine peso",
    "aud": "Australian dollar",
    "awg": "Aruban florin",
    "azn": "Azerbaijani manat",
    "bam": "Bosnia-Herzegovina Convertible Mark",
    "bbd": "Bajan dollar",
    "bch": "Bitcoin Cash",
    "bdt": "Bangladeshi taka",
    "bgn": "Bulgarian lev",
    "bhd": "Bahraini dinar",
    "bif": "Burundian Franc",
    "bmd": "Bermudan dollar",
    "bnb": "Binance Coin",
    "bnd": "Brunei dollar",
    "bob": "Bolivian boliviano",
    "brl": "Brazilian real",
    "bsd": "Bahamian dollar",
    "btc": "Bitcoin",
    "btn": "Bhutan currency",
    "bwp": "Botswanan Pula",
    "byn": "New Belarusian Ruble",
    "byr": "Belarusian Ruble",
    "bzd": "Belize dollar",
    "cad": "Canadian dollar",
    "cdf": "Congolese franc",
    "chf": "Swiss franc",
    "clf": "Chilean Unit of Account (UF)",
    "clp": "Chilean peso",
    "cny": "Chinese Yuan",
    "cop": "Colombian peso",
    "crc": "Costa Rican Colón",
    "cuc": "Cuban peso",
    "cup": "Cuban Peso",
    "cve": "Cape Verdean escudo",
    "czk": "Czech koruna",
    "djf": "Djiboutian franc",
    "dkk": "Danish krone",
    "doge": "Dogecoin",
    "dop": "Dominican peso",
    "dzd": "Algerian dinar",
    "egp": "Egyptian pound",
    "ern": "Eritrean nakfa",
    "etb": "Ethiopian birr",
    "etc": "Ethereum Classic",
    "eth": "Ether",
    "eur": "Euro",
    "fjd": "Fijian dollar",
    "fkp": "Falkland Islands pound",
    "gbp": "Pound sterling",
    "gel": "Georgian lari",
    "ggp": "GGPro",
    "ghs": "Ghanaian cedi",
    "gip": "Gibraltar pound",
    "gmd": "Gambian dalasi",
    "gnf": "Guinean franc",
    "gtq": "Guatemalan quetzal",
    "gyd": "Guyanaese Dollar",
    "hkd": "Hong Kong dollar",
    "hnl": "Honduran lempira",
    "hrk": "Croatian kuna",
    "htg": "Haitian gourde",
    "huf": "Hungarian forint",
    "idr": "Indonesian rupiah",
    "ils": "Israeli New Shekel",
    "imp": "CoinIMP",
    "inr": "Indian rupee",
    "iqd": "Iraqi dinar",
    "irr": "Iranian rial",
    "isk": "Icelandic króna",
    "jep": "Jersey Pound",
    "jmd": "Jamaican dollar",
    "jod": "Jordanian dinar",
    "jpy": "Japanese yen",
    "kes": "Kenyan shilling",
    "kgs": "Kyrgystani Som",
    "khr": "Cambodian riel",
    "kmf": "Comorian franc",
    "kpw": "North Korean won",
    "krw": "South Korean won",
    "kwd": "Kuwaiti dinar",
    "kyd": "Cayman Islands dollar",
    "kzt": "Kazakhstani tenge",
    "lak": "Laotian Kip",
    "lbp": "Lebanese pound",
    "link": "ChainLink",
    "lkr": "Sri Lankan rupee",
    "lrd": "Liberian dollar",
    "lsl": "Lesotho loti",
    "ltc": "Litecoin",
    "ltl": "Lithuanian litas",
    "lvl": "Latvian lats",
    "lyd": "Libyan dinar",
    "mad": "Moroccan dirham",
    "mdl": "Moldovan leu",
    "mga": "Malagasy ariary",
    "mkd": "Macedonian denar",
    "mmk": "Myanmar Kyat",
    "mnt": "Mongolian tugrik",
    "mop": "Macanese pataca",
    "mro": "Mauritanian ouguiya",
    "mur": "Mauritian rupee",
    "mvr": "Maldivian rufiyaa",
    "mwk": "Malawian kwacha",
    "mxn": "Mexican peso",
    "myr": "Malaysian ringgit",
    "mzn": "Mozambican Metical",
    "nad": "Namibian dollar",
    "ngn": "Nigerian naira",
    "nio": "Nicaraguan córdoba",
    "nok": "Norwegian krone",
    "npr": "Nepalese rupee",
    "nzd": "New Zealand dollar",
    "omr": "Omani rial",
    "pab": "Panamanian balboa",
    "pen": "Sol",
    "pgk": "Papua New Guinean kina",
    "php": "Philippine peso",
    "pkr": "Pakistani rupee",
    "pln": "Poland złoty",
    "pyg": "Paraguayan guarani",
    "qar": "Qatari Rial",
    "ron": "Romanian leu",
    "rsd": "Serbian dinar",
    "rub": "Russian ruble",
    "rwf": "Rwandan Franc",
    "sar": "Saudi riyal",
    "sbd": "Solomon Islands dollar",
    "scr": "Seychellois rupee",
    "sdg": "Sudanese pound",
    "sek": "Swedish krona",
    "sgd": "Singapore dollar",
    "shp": "Saint Helena pound",
    "sll": "Sierra Leonean leone",
    "sos": "Somali shilling",
    "srd": "Surinamese dollar",
    "std": "São Tomé and Príncipe Dobra (pre-2018)",
    "svc": "Salvadoran Colón",
    "syp": "Syrian pound",
    "szl": "Swazi lilangeni",
    "thb": "Thai baht",
    "theta": "Theta",
    "tjs": "Tajikistani somoni",
    "tmt": "Turkmenistani manat",
    "tnd": "Tunisian dinar",
    "top": "Tongan Paʻanga",
    "trx": "TRON",
    "try": "Turkish lira",
    "ttd": "Trinidad & Tobago Dollar",
    "twd": "New Taiwan dollar",
    "tzs": "Tanzanian shilling",
    "uah": "Ukrainian hryvnia",
    "ugx": "Ugandan shilling",
    "usd": "United States dollar",
    "usdt": "Tether",
    "uyu": "Uruguayan peso",
    "uzs": "Uzbekistani som",
    "vef": "Sovereign Bolivar",
    "vnd": "Vietnamese dong",
    "vuv": "Vanuatu vatu",
    "wst": "Samoan tala",
    "xaf": "Central African CFA franc",
    "xag": "Silver Ounce",
    "xau": "XauCoin",
    "xcd": "East Caribbean dollar",
    "xdr": "Special Drawing Rights",
    "xlm": "Stellar",
    "xof": "West African CFA franc",
    "xpf": "CFP franc",
    "xrp": "XRP",
    "yer": "Yemeni rial",
    "zar": "South African rand",
    "zmk": "Zambian kwacha",
    "zmw": "Zambian Kwacha",
    "zwl": "Zimbabwean Dollar"
} 
type Currency = keyof typeof Currencies;

export { Args, capitalize, isOnSnowflakeRange, ChannelTypeForSlashCommandArgument, ChannelTypeForSlashCommandArgumentToChannelName, ChannelTypeNameToChannelType, toSnakeCase, CommandNotFoundError, InvalidChannelTypeError, ArgChoice, InvalidChoiceError, Currencies, Currency }