import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { averageRating, formatDate, formatCurrency, estimatedDeliveryDate } from "@/lib/utils";
import { STORE_CONFIG } from "@/lib/config";
import { OrderConfirmationClient } from "./order-confirmation-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: PageProps) {
  const { orderNumber } = await params;
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  const serialized = {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail ?? null,
    customerAddress: order.customerAddress,
    city: order.city ?? null,
    pincode: order.pincode ?? null,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    notes: order.notes ?? null,
    createdAt: formatDate(order.createdAt),
    items: order.items.map((it) => ({
      id: it.id,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      lineTotal: it.lineTotal,
    })),
  };

  return <OrderConfirmationClient order={serialized} />;
}
