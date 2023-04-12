import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and} from "drizzle-orm/expressions";
import { albums } from "./../schemas/albumsSchema";
import { v4 as uuidv4 } from 'uuid';


export class AlbumsRepository {
    db: NodePgDatabase;

    constructor(pool: Pool) {
        const db = drizzle(pool)
        this.db = db
    }

    public getPhotographerAlbumsByLogin = async (login: string) => {
        return await this.db.select().from(albums).where(eq(albums.photographerLogin,login))
    }

    public addAlbumRecord = async (albumName: string, location: string, date: string, login: string) => {
        console.log(albumName, login, uuidv4())
        await this.db.insert(albums).values({
            albumName,
            photographerLogin:login,
            albumID: uuidv4(),
            date,
            location
        })
    }

    public isUsersAlbum = async (login: string, albumID: string) => {
        const album = await this.db.select().from(albums).where(and(eq(albums.photographerLogin,login),eq(albums.albumID, albumID)))
        if (!album) {
            return false
        }
        return true
    }
}