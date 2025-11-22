import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Filters skeleton */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 flex-1 max-w-sm" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Table skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Table header */}
                        <div className="grid grid-cols-7 gap-4 pb-4 border-b">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-20" />
                        </div>

                        {/* Table rows */}
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="grid grid-cols-7 gap-4 py-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-8 w-20" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
