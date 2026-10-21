
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { customerName, email, phone, address, items } = body;

    if (
      typeof customerName !== "string" ||
      !customerName.trim() ||
      typeof email !== "string" ||
      !email.includes("@") ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof address !== "string" ||
      !address.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "Please provide valid customer and cart details." },
        { status: 400 }
      );
    }

    const quantities = new Map<number, number>();

    for (const item of items) {
      if (
        !Number.isInteger(item.productId) ||
        item.productId <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        item.quantity > 100
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid product or quantity." },
          { status: 400 }
        );
      }

      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const productIds = [...quantities.keys()];

      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      let total = 0;

      const orderItems = products.map((product) => {
        const quantity = quantities.get(product.id)!;

        if (product.stock < quantity) {
          throw new Error(`OUT_OF_STOCK:${product.name}`);
        }

        const unitPrice = Math.round(
          product.price * (100 - product.discount) / 100
        );

        total += unitPrice * quantity;

        return {
          productId: product.id,
          quantity,
          unitPrice,
        };
      });

      for (const item of orderItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count !== 1) {
          throw new Error("STOCK_CHANGED");
        }
      }

      return tx.order.create({
        data: {
          customerName: customerName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          total,
          status: "PENDING",
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Test order created. Payment has not been collected.",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PRODUCT_NOT_FOUND") {
        return NextResponse.json(
          { success: false, error: "One or more products no longer exist." },
          { status: 400 }
        );
      }

      if (error.message.startsWith("OUT_OF_STOCK:")) {
        return NextResponse.json(
          {
            success: false,
            error: `${error.message.slice("OUT_OF_STOCK:".length)} is out of stock.`,
          },
          { status: 409 }
        );
      }

      if (error.message === "STOCK_CHANGED") {
        return NextResponse.json(
          { success: false, error: "Stock changed. Please try again." },
          { status: 409 }
        );
      }
    }

    console.error("Create order error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to create order." },
      { status: 500 }
    );
  }
}
