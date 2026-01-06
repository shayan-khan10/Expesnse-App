
import { Card } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Table, TableBody, TableCaption, TableHeader, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { formatNumber } from "../../utils/formatNumber";
import { formatDate, formatTime } from "../../utils/formatTimestamp";
import { PersonalExpense } from "@/services/expenses/expenses.service";

interface PersonalExpensesTableProps {
    expenses: PersonalExpense[];
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

export function PersonalExpensesTable({ expenses, onDelete, isDeleting }: PersonalExpensesTableProps) {
    return (
        <Card className="py-1 px-6">
            <Accordion type="single" collapsible defaultValue="">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xl font-semibold">
                        Personal Expenses
                    </AccordionTrigger>
                    <AccordionContent>
                        <Table>
                            <TableCaption>All your personal expenses.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No.</TableHead>
                                    <TableHead>Expense</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Type</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((exp, index) => (
                                    <Popover key={exp.id}>
                                        <PopoverTrigger asChild>
                                            <TableRow className="cursor-pointer hover:bg-muted/50">
                                                <TableCell>{index + 1}.</TableCell>
                                                <TableCell>{exp.expense_title}</TableCell>
                                                <TableCell className="text-right">{formatNumber(exp.amount)}</TableCell>
                                                <TableCell className="text-right">{exp.type || "Other"}</TableCell>
                                            </TableRow>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 overflow-y-auto max-h-[80vh]">
                                            <div className="grid gap-2">
                                                <div className="flex flex-row justify-between gap-4 mb-3">
                                                    <h2 className="font-semibold">Expense Details:</h2>
                                                    <div className="flex font-semibold gap-2">
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" className="h-4 w-4 py-2 mt-1" disabled={isDeleting}>
                                                                    <Trash2 className="text-destructive h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete the expense <b>{exp.expense_title}</b>? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => onDelete(exp.id)}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        {isDeleting ? "Deleting..." : "Delete"}
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between gap-4 px-2">
                                                    <h4 className="text-muted-foreground">Expense:</h4>
                                                    <h4 className="text-foreground font-medium">{exp.expense_title}</h4>
                                                </div>
                                                <div className="flex justify-between gap-4 px-2">
                                                    <h4 className="text-muted-foreground">Amount:</h4>
                                                    <h4 className="text-foreground font-medium">{formatNumber(exp.amount)}</h4>
                                                </div>
                                                {/* Note: 'categories' join not available in current RPC, defaulting to 'Not defined' if we wanted to be strict, but keeping it simple for now or showing 'Not defined' as per plan logic */}
                                                <div className="flex justify-between gap-4 px-2">
                                                    <h4 className="text-muted-foreground">Category:</h4>
                                                    <h4 className="text-foreground font-medium">Not defined</h4>
                                                </div>
                                                <div className="flex justify-between gap-4 px-2">
                                                    <h4 className="text-muted-foreground">Payment:</h4>
                                                    <h4 className="text-foreground font-medium">{exp.type || "Other"}</h4>
                                                </div>
                                                <div className="flex justify-between gap-4 px-2">
                                                    <h4 className="text-muted-foreground">Note:</h4>
                                                    <p className="text-foreground font-medium h-auto overflow-x-auto text-right">{exp.note || "-"}</p>
                                                </div>
                                                <div className="flex justify-between gap-4 px-2">
                                                    <h4 className="text-muted-foreground">Date:</h4>
                                                    <h4 className="text-foreground font-medium">{formatDate(exp.created_at)}</h4>
                                                </div>
                                                <div className="flex justify-between gap-4 px-2">
                                                    <h4 className="text-muted-foreground">Time:</h4>
                                                    <h4 className="text-foreground font-medium">{formatTime(exp.created_at)}</h4>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                ))}
                            </TableBody>
                        </Table>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    );
}
