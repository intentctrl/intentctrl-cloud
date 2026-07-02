"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";
import { axiosInstance } from "@/lib/api-client";
import { ChatSessionsTable } from "@/components/chat-sessions/table";
import { ChatSessionsStats } from "@/components/chat-sessions/stats";
import type { ApiResponse, PaginatedChatSessionsResponse } from "@intentctrl-cloud/types";

export default function ChatSessionsPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const queryParams = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    sorting: JSON.stringify(sorting),
    columnFilters: JSON.stringify(columnFilters),
  });

  const { data, isFetching } = useQuery<PaginatedChatSessionsResponse>({
    queryKey: ["chat-sessions", pagination, sorting, columnFilters],
    queryFn: async () => {
      const { data: response } = await axiosInstance.get<ApiResponse<PaginatedChatSessionsResponse>>(
        `/chat/sessions?${queryParams}`,
      );
      return response.data;
    },
    placeholderData: (prev) =>
      prev ?? {
        items: [],
        rowCount: 0,
        pageCount: 1,
        pageIndex: 0,
        pageSize: 10,
      },
  });

  const sessions = data?.items ?? [];

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chat Sessions</h1>
          <p className="text-sm text-muted-foreground">View and manage chat sessions.</p>
        </div>

        <ChatSessionsStats sessions={sessions} />

        <ChatSessionsTable
          data={sessions}
          pageCount={data?.pageCount ?? 1}
          pagination={pagination}
          sorting={sorting}
          columnFilters={columnFilters}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          onColumnFiltersChange={setColumnFilters}
          isLoading={isFetching}
        />
      </div>
    </main>
  );
}
