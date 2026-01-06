"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Plus } from "lucide-react"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const FormSchema = z.object({
    category_name: z.string().min(1, {
        message: "Category name cannot be empty.",
    }),
})

interface CreateCategoryAccordionProps {
    onCreate: (name: string) => Promise<boolean>
    isCreating: boolean
}

export function CreateCategoryAccordion({ onCreate, isCreating }: CreateCategoryAccordionProps) {
    const [accordionValue, setAccordionValue] = useState<string | undefined>("")

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            category_name: "",
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const success = await onCreate(data.category_name)
        if (success) {
            form.reset()
            setAccordionValue("") // Close accordion
        }
    }

    return (
        <Accordion
            type="single"
            collapsible
            value={accordionValue}
            onValueChange={setAccordionValue}
            className="p-0 m-0"
        >
            <AccordionItem value="item-1">
                <AccordionTrigger className="text-xl font-semibold">
                    <div className="flex flex-row gap-2 items-center">
                        <Plus className="h-6 w-6" />
                        New Category
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="w-full mt-2 space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="category_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. Groceries, Utilities..."
                                                {...field}
                                                disabled={isCreating}
                                                autoComplete="off"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isCreating}>
                                {isCreating ? "Adding..." : "Add New Category"}
                            </Button>
                        </form>
                    </Form>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
