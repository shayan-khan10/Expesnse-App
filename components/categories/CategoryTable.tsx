import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Category } from "@/services/categories/category.service"
import { DeleteCategoryDialog } from "./DeleteCategoryDialog"

interface CategoryTableProps {
    categories: Category[]
    onDelete: (id: string) => Promise<boolean>
    isDeleting: boolean
}

export function CategoryTable({ categories, onDelete, isDeleting }: CategoryTableProps) {
    if (categories.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No categories found. Create one to get started.
            </div>
        )
    }

    return (
        <Table>
            <TableCaption>All your family categories.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px]">No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {categories.map((cat, index) => (
                    <TableRow key={cat.id}>
                        <TableCell>{index + 1}.</TableCell>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell className="text-right">
                            <DeleteCategoryDialog
                                category={cat}
                                onDelete={onDelete}
                                isDeleting={isDeleting}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
