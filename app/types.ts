import { betHorses, combo, horses, matchStatus } from "@prisma/client"

export interface levelData {
    levelId: number
    levelName: string
    horses: {
        id: number
        name: string
        initial_price: string | null;
        final_price: string | null;
    }[]
    status: matchStatus
    firstWinnerId: null | number
    secondWinnerId: null | number
    forcastPrice : string
}
export interface client {
    id: number
    name: string
    betCount: number
    madeBy: string
}
export interface bet {
    clientId: number
    isOne: boolean
    isTow: boolean
    isThree: boolean
    isFoure: boolean
    isForcast: boolean
    horses: {
        horseId: number
        levelId: number
    }[] | null
    forcastHorses: {
        levelId: number
        firstHorseId: number
        secondHorseId: number
    } | null
    ammount: number
}
type Horse = {
    id: number;
    name: string;
    initial_price: string;
    final_price: string | null;
};

type Level = {
    id: number;
    matchId: number;
    name: string;
    madeBy: number;
};

type Card = {
    id: number;
    betId: number;
    ammount: string;
    horseId: number;
    levelId: number;
    horse: Horse;
    level: Level;
};

type User = {
    id: number;
    name: string;
    password: string;
};

type Customer = {
    id: number;
    name: string;
    madeBy: number;
};

export type Bet = {
    id: number;
    customerId: number;
    isOne: boolean;
    isTow: boolean;
    isThree: boolean;
    isFoure: boolean;
    madeBy: number;
    user: User;
    customer: Customer;
    card: Card[];
    betHorses: {
        id: number;
        betId: number;
        horseId: number;
        levelId: number;
        horse :   Horse;
    }[]
    combo: combo[];
};
export interface cards {
    bet: {
        id: number;
        madeBy: number;
        customerId: number;
        isOne: boolean;
        isTow: boolean;
        isThree: boolean;
        isFoure: boolean;
        customer: {
            name: string;
            id: number;
            madeBy: number;
        }
    };
    combo: combo[]
    horse: horses
    ammount: string
}