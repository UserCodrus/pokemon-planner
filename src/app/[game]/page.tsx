import { Suspense } from "react";

import GameData from "../../../data/games.json";
import { App } from "../../core";
import { LoadingScreen } from "@/components";

export async function generateStaticParams() {
	return GameData.map((value) => { return { game: value.id } });
}

export default async function Page(props: {params: Promise<{ game: string }>}) {
	const params = await props.params;

	return (
		<Suspense fallback={<LoadingScreen />}>
			<App game={params.game} />
		</Suspense>
	);
}