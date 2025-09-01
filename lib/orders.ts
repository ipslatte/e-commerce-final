import { ObjectId } from "mongodb";

export interface Order {
  _id: ObjectId;
  userId: ObjectId;
  total: number;
  status: string;
  createdAt: Date;
}

export async function getRecentOrders(): Promise<Order[]> {
  // TODO: Implement actual database query
  return [];
}
