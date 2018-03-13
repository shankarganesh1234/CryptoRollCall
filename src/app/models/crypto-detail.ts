import {CryptoNews} from "./crypto-news";

export class CryptoDetail {
    id: string;
    imageUrl: string;
    symbol: string;
    name: string;
    algorithm: string;
    proofType: string;
    isPreMined: boolean;
    twitterUrl: string;
    redditUrl: string;
    facebookUrl: string;
    codeRepoLinks: string[];
    websiteUrl: string;
    availableExchanges: string[];
    seoTitle: string;
    seoDescription: string;
    coinNews: CryptoNews;
    fullName: string;
}