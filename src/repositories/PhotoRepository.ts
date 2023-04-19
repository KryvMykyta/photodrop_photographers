import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and} from "drizzle-orm/expressions";
import { v4 as uuidv4 } from 'uuid';
import { sql } from "drizzle-orm";
import { photos, usersPhotos } from "./../schemas/photoSchema";


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

    public getPhoto = async (login: string, photoID: string) => {
        const photo = await this.db.select().from(photos).where(and(eq(photos.photographerLogin,login),eq(photos.photoID, photoID)))
        return photo
    }

    public addUsersToPhoto = async (photoID: string, users: string[]) => {
        const arrayToLoad = users.map((user) => {
            return {
                photoID,
                phone: user
            }
        })
        await this.db.insert(usersPhotos).values(arrayToLoad)
    }

    public getUsersPhoto = async (phoneNumber: string) => {
        return (await this.db.execute(sql`select * from photos where ${phoneNumber} = any (people);`)).rows
    }

    public getAlbumPhotos = async (albumID: string) => {
        return await this.db.select().from(photos).where(eq(photos.albumID,albumID))
    }

}