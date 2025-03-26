'use client';

import { ReactElement } from "react";

import * as Components from "./components";
import Pokedex from "../data/pokedex.json";

const party_size = 6;

/**
 * A component that contains the user's currently selected party
 */
export function PartyDisplay(): ReactElement
{
	const components: ReactElement[] = [];
	for (let i=0; i < party_size; ++i)
	{
		components.push(<Components.PartyMember id={(i*3)} key={i}/>)
	}

	return (
		<div className="flex-row space-x-2">
			{components}
		</div>
	);
}

/**
 * A component that contains all selectable pokemon from a given pokedex
 */
export function PokedexDisplay(props: {pokedex: string}): ReactElement
{
	// Find the pokedex with the id matching the provided prop
	let pokedex: typeof Pokedex[0] | undefined;
	for (const dex_data of Pokedex)
	{
		if (dex_data.id === props.pokedex)
		{
			pokedex = dex_data;
			break;
		}
	}

	if (!pokedex)
		return <div>{"Unknown pokedex id " + props.pokedex}</div>

	// Create a set of selctor components for each pokemon in the pokedex
	const components: ReactElement[] = [];
	for (let i=0; i < pokedex.entries.length; ++i)
	{
		components.push(<Components.PokemonSelector id={pokedex.entries[i]} key={i}/>)
	}

	return (
		<div className="flex-row space-x-2 space-y-2 justify-stretch">
			{components}
		</div>
	);
}