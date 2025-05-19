import { winners } from "@prisma/client";
import prisma from "./prisma";

export async function getLevelWiners(id: number) {
    const winners = await prisma.winners.findFirst({
        where: {
            levelId: id
        }
    })
    if (winners) {
        return winners as winners
    } else {
        return null
    }
}