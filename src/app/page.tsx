import Image from "next/image";

import * as Components from "../components";
import * as Containers from "../containers";

export default function Home() {
	const mon = {
		id: 6,
		name: "Charizard",
		type: [
			"fire",
			"flying"
		]
	};

	return (
		<div className="grid items-center justify-items-center min-h-screen min-w-full gradient text-foreground font-[family-name:var(--font-geist-sans)]">
			<Containers.PartyDisplay />
			<Containers.PokedexDisplay pokedex="hoenn" />
		</div>
	);
}
