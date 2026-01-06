
import { Card } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Table, TableBody, TableCaption, TableHeader, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatNumber } from "../../utils/formatNumber";
import { RecentExpense } from "@/services/expenses/expenses.service";

interface RecentExpensesTableProps {
    expenses: RecentExpense[];
}

export function RecentExpensesTable({ expenses }: RecentExpensesTableProps) {
    return (
        <Card className="py-1 px-6">
            <Accordion type="single" collapsible defaultValue="">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xl font-semibold">
                        Recent Family Expenses
                    </AccordionTrigger>
                    <AccordionContent>
                        <Table>
                            <TableCaption>Last 5 expenses you and your family made.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No.</TableHead>
                                    <TableHead>Expense</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Person</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((r_exp, index) => (
                                    <TableRow key={r_exp.id}>
                                        <TableCell>{index + 1}.</TableCell>
                                        <TableCell>{r_exp.expense_title}</TableCell>
                                        <TableCell className="text-right">{formatNumber(r_exp.amount)}</TableCell>
                                        <TableCell className="text-right">{r_exp.username}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    );
}
