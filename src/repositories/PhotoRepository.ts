import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and} from "drizzle-orm/expressions";
import { v4 as uuidv4 } from 'uuid';
import { sql } from "drizzle-orm";
import { photos } from "./../schemas/photoSchema";


export class PhotoRepository {
    db: NodePgDatabase;

    constructor(pool: Pool) {
        const db = drizzle(pool)
        this.db = db
    }

    public addPhotoToAlbum = async (albumID: string, photoID: string, login: string) => {
        await this.db.insert(photos).values({
            albumID,
            photoID,
            photographerLogin: login
        })
    }

    public isUsersPhoto = async (login: string, photoID: string) => {
        const photo = await this.db.select().from(photos).where(and(eq(photos.photographerLogin,login),eq(photos.photoID, photoID)))
        if (!photo) {
            return false
        }
        return true
    }

    public addUser = async (photoID: string, phoneNumber: string) => {
        // console.log(`update photos set people = array_append(people, '${phoneNumber}') where photoid = '${photoID}'`)
        await this.db.execute(sql`update photos set people = array_append(people, ${phoneNumber}) where photoid = ${photoID}`)
    }

    public getUsersPhoto = async (phoneNumber: string) => {
        return (await this.db.execute(sql`select * from photos where ${phoneNumber} = any (people);`)).rows
    }

}