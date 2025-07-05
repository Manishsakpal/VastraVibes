"use client";

import { useVisitorContext } from "@/context/visitor-context";
import { useOrderContext } from "@/context/order-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, IndianRupee, ShoppingCart, Loader2 } from 'lucide-react';
import { useMemo } from "react";

const StatCard = ({ title, value, icon: Icon, isLoading }: { title: string, value: string | number, icon: React.ElementType, isLoading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
                <div className="text-2xl font-bold">{value}</div>
            )}
        </CardContent>
    </Card>
);

export default function StatsCards() {
    const { visitorCount, isLoading: isVisitorLoading } = useVisitorContext();
    const { orders, isLoading: isOrderLoading } = useOrderContext();

    const totalRevenue = useMemo(() => {
        return orders.reduce((acc, order) => acc + order.totalAmount, 0).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }, [orders]);

    const totalOrders = useMemo(() => orders.length, [orders]);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
                title="Total Revenue" 
                value={totalRevenue}
                icon={IndianRupee}
                isLoading={isOrderLoading}
            />
            <StatCard 
                title="Total Orders" 
                value={totalOrders} 
                icon={ShoppingCart}
                isLoading={isOrderLoading}
            />
            <StatCard 
                title="Unique Visitors" 
                value={visitorCount} 
                icon={Users}
                isLoading={isVisitorLoading}
            />
        </div>
    );
}
