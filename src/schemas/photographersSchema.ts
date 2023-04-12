import { InferModel } from 'drizzle-orm';
import {
    text,
    real,
    serial,
    pgTable
  } from 'drizzle-orm/pg-core';

export const photographers = pgTable('photographers', {
    PhotographerID: serial('photographerID').notNull().primaryKey(),
    login: text('login').notNull().primaryKey(),
    password: text('pass').notNull(),
    email: text('email'),
    name: text('name')
})

export type PhotographerType = InferModel<typeof photographers>

