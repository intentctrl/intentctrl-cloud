"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { IconArrowsSort, IconEye, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/api-client";
import type { ApiResponse, ChatSessionResponse } from "@intentctrl-cloud/types";

type ChatSessionsTableProps = {
  data: ChatSessionResponse[];
  pageCount: number;
  pagination: { pageIndex: number; pageSize: number };
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  onPaginationChange: (updater: any) => void;
  onSortingChange: (updater: any) => void;
  onColumnFiltersChange: (updater: any) => void;
  isLoading: boolean;
};

export function ChatSessionsTable(props: ChatSessionsTableProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await axiosInstance.delete<ApiResponse<null>>(`/chat/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      toast.success("Chat session deleted");
      setOpenDeleteDialog(false);
      setDeletingSessionId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to delete chat session");
    },
  });

  const handleDeleteConfirm = async () => {
    if (deletingSessionId) await deleteMutation.mutateAsync(deletingSessionId);
  };

  const columns: ColumnDef<ChatSessionResponse>[] = [
    {
      accessorKey: "visitorId",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Visitor
          <IconArrowsSort className="size-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{row.original.visitorId}</code>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) =>
        row.original.active ? (
          <Badge className="rounded-sm" variant="default">
            Active
          </Badge>
        ) : (
          <Badge className="rounded-sm" variant="secondary">
            Inactive
          </Badge>
        ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Created
          <IconArrowsSort className="size-4" />
        </Button>
      ),
      cell: ({ row }) => format(row.original.createdAt, "MMM d, yyyy HH:mm"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" render={<Link href={`/chat/${session.id}`} />} nativeButton={false}>
              <IconEye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => {
                setDeletingSessionId(session.id);
                setOpenDeleteDialog(true);
              }}
            >
              <IconTrash className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: props.data,
    columns,
    state: {
      pagination: props.pagination,
      sorting: props.sorting,
      columnFilters: props.columnFilters,
    },
    onPaginationChange: props.onPaginationChange,
    onSortingChange: props.onSortingChange,
    onColumnFiltersChange: props.onColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    pageCount: props.pageCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  return (
    <>
      <div className="rounded-lg border">
        <div className="p-4">
          <Input
            placeholder="Filter by visitor..."
            value={(table.getColumn("visitorId")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("visitorId")?.setFilterValue(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {props.isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                    No chat sessions found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-muted/50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t p-4">
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete chat session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat session? All messages will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
