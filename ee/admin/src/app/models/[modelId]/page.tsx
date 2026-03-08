import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ModelProviderCharts } from "@/components/model-provider-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createServerApiClient } from "@/lib/server-api";

function formatNumber(n: number) {
	return new Intl.NumberFormat("en-US").format(n);
}

export default async function ModelDetailPage({
	params,
}: {
	params: Promise<{ modelId: string }>;
}) {
	const { modelId } = await params;
	const decodedModelId = decodeURIComponent(modelId);

	const $api = await createServerApiClient();
	const { data } = await $api.GET("/admin/models/{modelId}", {
		params: { path: { modelId: encodeURIComponent(decodedModelId) } },
	});

	if (!data) {
		return (
			<div className="mx-auto flex w-full max-w-[1920px] flex-col gap-6 px-4 py-8 md:px-8">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/models">
						<ArrowLeft className="mr-1 h-4 w-4" />
						Back to Models
					</Link>
				</Button>
				<div className="flex h-64 items-center justify-center text-muted-foreground">
					Model not found
				</div>
			</div>
		);
	}

	const { model, providers } = data;
	const displayName = model.name !== model.id ? model.name : model.id;
	const errorRate =
		model.logsCount > 0
			? ((model.errorsCount / model.logsCount) * 100).toFixed(1)
			: "0.0";

	return (
		<div className="mx-auto flex w-full max-w-[1920px] flex-col gap-6 px-4 py-8 md:px-8">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/models">
						<ArrowLeft className="mr-1 h-4 w-4" />
						Back
					</Link>
				</Button>
			</div>

			<header>
				<h1 className="text-3xl font-semibold tracking-tight">{displayName}</h1>
				{model.name !== model.id && (
					<p className="mt-1 text-sm text-muted-foreground">{model.id}</p>
				)}
				<div className="mt-3 flex flex-wrap items-center gap-2">
					<Badge variant="outline">{model.family}</Badge>
					<Badge variant={model.status === "active" ? "secondary" : "outline"}>
						{model.status}
					</Badge>
					{model.free && <Badge variant="default">Free</Badge>}
				</div>
			</header>

			<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-xl border border-border/60 p-4 shadow-sm">
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Total Requests
					</p>
					<p className="mt-1 text-2xl font-semibold tabular-nums">
						{formatNumber(model.logsCount)}
					</p>
				</div>
				<div className="rounded-xl border border-border/60 p-4 shadow-sm">
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Errors
					</p>
					<p className="mt-1 text-2xl font-semibold tabular-nums">
						{formatNumber(model.errorsCount)}{" "}
						<span className="text-sm text-muted-foreground">
							({errorRate}%)
						</span>
					</p>
				</div>
				<div className="rounded-xl border border-border/60 p-4 shadow-sm">
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Cached
					</p>
					<p className="mt-1 text-2xl font-semibold tabular-nums">
						{formatNumber(model.cachedCount)}
					</p>
				</div>
				<div className="rounded-xl border border-border/60 p-4 shadow-sm">
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Avg TTFT
					</p>
					<p className="mt-1 text-2xl font-semibold tabular-nums">
						{model.avgTimeToFirstToken !== null
							? `${Math.round(model.avgTimeToFirstToken)}ms`
							: "\u2014"}
					</p>
				</div>
			</section>

			<section className="space-y-4">
				<h2 className="text-xl font-semibold">
					Per-Provider History{" "}
					<span className="text-sm font-normal text-muted-foreground">
						({providers.length} provider{providers.length !== 1 ? "s" : ""})
					</span>
				</h2>
				<ModelProviderCharts modelId={decodedModelId} providers={providers} />
			</section>
		</div>
	);
}
