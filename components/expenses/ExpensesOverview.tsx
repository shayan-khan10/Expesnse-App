
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatNumber } from "../../utils/formatNumber";

interface ExpensesOverviewProps {
    familyTotal: number;
    personalTotal: number;
}

export function ExpensesOverview({ familyTotal, personalTotal }: ExpensesOverviewProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">Overview</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex">
                    <h3 className="text-muted-foreground mr-2">Family:</h3>
                    <h3 className="font-medium text-foreground">{formatNumber(familyTotal)}</h3>
                </div>
                <div className="flex mt-1">
                    <h3 className="text-muted-foreground mr-2">Personal:</h3>
                    <h3 className="font-medium text-foreground">{formatNumber(personalTotal)}</h3>
                </div>
            </CardContent>
        </Card>
    );
}
