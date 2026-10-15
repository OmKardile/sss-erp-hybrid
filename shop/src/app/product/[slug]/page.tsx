import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { averageRating } from "@/lib/utils";
import { ProductDetailClient } from "./product-detail-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await db.shopProduct.findUnique({
    where: { slug },
    include: {
      reviews: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  // Related products (same category, exclude current)
  const related = await db.shopProduct.findMany({
    where: {
      isActive: true,
      category: product.category,
      id: { not: product.id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const ratings = product.reviews.map((r) => r.rating);
  const avgRating = averageRating(ratings);

  const serialized = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    brand: product.brand ?? null,
    category: product.category ?? null,
    unitType: product.unitType ?? "pcs",
    stock: product.stock ?? 0,
    image: product.image ?? null,
    isFeatured: !!product.isFeatured,
    description: product.description ?? null,
    isActive: !!product.isActive,
    reviews: product.reviews.map((r) => ({
      id: r.id,
      customerName: r.customerName,
      rating: r.rating,
      comment: r.comment ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
    avgRating,
    reviewCount: ratings.length,
  };

  const relatedSerialized = related.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    brand: p.brand ?? null,
    category: p.category ?? null,
    unitType: p.unitType ?? "pcs",
    stock: p.stock ?? 0,
    image: p.image ?? null,
    isFeatured: !!p.isFeatured,
  }));

  return (
    <ProductDetailClient
      product={serialized}
      related={relatedSerialized}
    />
  );
}
