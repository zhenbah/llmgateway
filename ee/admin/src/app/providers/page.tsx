import Link from "next/link";
import { Suspense } from "react";

import { ProvidersTable } from "@/components/providers-table";
import { TimeRangePicker } from "@/components/time-range-picker";
import { Button } from "@/components/ui/button";
import { createServerApiClient } from "@/lib/server-api";

import type { paths } from "@/lib/api/v1";
import type { TimeseriesRange } from "@/lib/types";

type ProviderSortBy = NonNullable<
	paths["/admin/providers"]["get"]["parameters"]["query"]
>["sortBy"];
type SortOrder = "asc" | "desc";

const validRanges = new Set(["7d", "30d", "90d", "365d", "all"]);

function SignInPrompt() {
	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<div className="w-full max-w-md text-center">
				<div className="mb-8">
					<h1 className="text-3xl font-semibold tracking-tight">
						Admin Dashboard
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Sign in to access the admin dashboard
					</p>
				</div>
				<Button asChild size="lg" className="w-full">
					<Link href="/login">Sign In</Link>
				</Button>
			</div>
		</div>
	);
}

export default async function ProvidersPage({
	searchParams,
}: {
	searchParams?: Promise<{
		sortBy?: string;
		sortOrder?: string;
		range?: string;
	}>;
}) {
	const params = await searchParams;
	const sortBy = (params?.sortBy as ProviderSortBy) ?? "logsCount";
	const sortOrder = (params?.sortOrder as SortOrder) || "desc";
	const rangeParam = typeof params?.range === "string" ? params.range : "all";
	const range: TimeseriesRange = validRanges.has(rangeParam)
		? (rangeParam as TimeseriesRange)
		: "all";

	const $api = await createServerApiClient();
	const { data } = await $api.GET("/admin/providers", {
		params: { query: { sortBy, sortOrder } },
	});

	if (!data) {
		return <SignInPrompt />;
	}

	return (
		<div className="mx-auto flex w-full max-w-[1920px] flex-col gap-6 px-4 py-8 md:px-8 overflow-hidden">
			<header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">Providers</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{data.total} providers — click a row to view history
					</p>
				</div>
				<Suspense>
					<TimeRangePicker value={range} />
				</Suspense>
			</header>

			<div className="min-w-0 overflow-x-auto rounded-lg border border-border/60 bg-card">
				<ProvidersTable
					providers={data.providers}
					sortBy={sortBy}
					sortOrder={sortOrder}
					range={range}
				/>
			</div>
		</div>
	);
}
