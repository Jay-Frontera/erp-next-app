'use server'

import { NextResponse } from 'next/server';

import connectToDb from '@/app/lib/db';
import { Item } from '@/app/models/item';
import {
  ConfirmedAdminstrationItemEditPostRequest,
} from '@/app/types/requests';
import { ItemStateTypes } from '@/app/types/sales';

export async function GET(request: Request) {
    await connectToDb();

    const items = await Item.find();

    return NextResponse.json(items);
}

export async function POST(request: Request) {
    await connectToDb();

    const data: ConfirmedAdminstrationItemEditPostRequest = await request.json();

    await Item.findOneAndUpdate(
        {
            id: data.id,
            state_type: ItemStateTypes.STOCKED
        },
        {
            $set: {
                price: data.price,
                supply: data.supply
            }
        },
        {
            upsert: true,
            new: true
        }
    );

    await Promise.allSettled([
        Item.findOneAndUpdate(
            {
                id: data.id,
                state_type: ItemStateTypes.LOST
            },
            {
                $set: {
                    supply: 0
                }
            },
            {
                upsert: true
            }
        ),
        Item.findOneAndUpdate(
            {
                id: data.id,
                state_type: ItemStateTypes.PREPARING
            },
            {
                $set: {
                    supply: 0
                }
            },
            {
                upsert: true
            }
        ),
        Item.findOneAndUpdate(
            {
                id: data.id,
                state_type: ItemStateTypes.SOLD
            },
            {
                $set: {
                    supply: 0
                }
            },
            {
                upsert: true
            }
        ),

        Item.findOneAndUpdate(
            {
                id: data.id,
                state_type: ItemStateTypes.AVAILABLE
            },
            {
                $set: {
                    supply: 0
                }
            },
            {
                upsert: true
            }
        )
    ])

    return NextResponse.json({ message: 'Item updated' });
}