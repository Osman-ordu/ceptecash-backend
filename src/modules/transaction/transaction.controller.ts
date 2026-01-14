import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { buyAsset } from './transaction.service';
import prisma from '../../config/prisma';

export async function buyAssetController(req: Request, res: Response) {
  try {
    const { userId, assetId, quantity, unitPrice } = req.body;

    if (!userId || !assetId || !quantity || !unitPrice) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        error: `User with id ${userId} does not exist` 
      });
    }

    let asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      asset = await prisma.asset.findUnique({
        where: { code: assetId },
      });
    }

    if (!asset) {
      return res.status(404).json({ 
        message: 'Asset not found',
        error: `Asset with id or code "${assetId}" does not exist. Available asset codes: XAU, USD, BTC` 
      });
    }

    const quantityDecimal = new Prisma.Decimal(quantity);
    const unitPriceDecimal = new Prisma.Decimal(unitPrice);

    if (quantityDecimal.lte(0)) {
      return res.status(400).json({ 
        message: 'Invalid quantity',
        error: 'Quantity must be greater than 0' 
      });
    }

    if (unitPriceDecimal.lte(0)) {
      return res.status(400).json({ 
        message: 'Invalid unit price',
        error: 'Unit price must be greater than 0' 
      });
    }

    await buyAsset(
      userId,
      asset.id,
      quantityDecimal,
      unitPriceDecimal
    );

    return res.status(201).json({ message: 'BUY successful' });
  } catch (error) {
    console.error('Error in buyAssetController:', error);
    
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return res.status(400).json({ 
        message: 'Invalid reference',
        error: 'The provided userId or assetId does not exist in the database' 
      });
    }

    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
