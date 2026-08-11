import type { ActionType, DocumentType } from "@prisma/client";
import db from "../db.server";

export async function logAction(params: {
  shop: string;
  actionType: ActionType;
  documentType: DocumentType;
  orderId?: string | null;
  orderName?: string | null;
}) {
  try {
    await db.actionLog.create({
      data: {
        shop: params.shop,
        actionType: params.actionType,
        documentType: params.documentType,
        orderId: params.orderId || null,
        orderName: params.orderName || null,
      },
    });
  } catch (error) {
    console.error("Failed to log action:", error);
  }
}
