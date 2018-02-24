export class CryptoPrice {
    id: string;
    symbol: string;
    name: string;
    price_usd: string;
    price: string;
    price_btc: string;
    isFavorite: boolean = false;
    isWatch: boolean = false;
    rank: number;
    percent_change_1h: string;
    percent_change_24h: string;
    percent_change_7d: string;
    market_cap_usd:string;
    available_supply:string;
    total_supply:string;
    max_supply:string;
}