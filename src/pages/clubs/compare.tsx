import React, { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

// Products will be loaded from database via admin panel
// This page requires products to be added first

export default function EquipmentComparison() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Equipment Comparison</h2>
            <p className="text-muted-foreground mb-6">
              Product comparison requires products to be added via the admin panel first.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link href="/admin/products">
                  Go to Products Admin
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}