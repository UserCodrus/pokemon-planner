'use client';

import { ReactElement } from "react";

import * as Components from "./components";

const party_size = 6;

export function PartyDisplay(): ReactElement
{
	const components: ReactElement[] = [];
	for (let i=0; i < party_size; ++i)
	{
		components.push(<Components.PartyMember id={(i*3)} key={i}/>)
	}

	return (
		<div className="flex-row space-x-2 justify-stretch">
			{components}
		</div>
	);
}