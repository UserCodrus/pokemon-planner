import Image from "next/image";

import * as Core from "../core";

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
			<Core.App />
		</div>
	);
}
