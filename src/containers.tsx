'use client';

import { ReactElement } from "react";

import * as Components from "./components";
import Pokedex from "../data/pokedex.json";

const party_size = 6;

export type SelectedPokemon = {
	id: number,
	form?: string
};

/**
 * A component that contains the user's currently selected party
 */
export function PartyDisplay(props: {pokemon: SelectedPokemon[], onSelect: Components.SelectionCallback}): ReactElement
{
	const components: ReactElement[] = [];
	for (let i=0; i < props.pokemon.length; ++i)
	{
		components.push(<Components.PartyMember id={props.pokemon[i].id} form={props.pokemon[i].form} key={i} onClick={props.onSelect}/>)
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
export function PokedexDisplay(props: {pokedex: string, onSelect: Components.SelectionCallback}): ReactElement
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
		components.push(<Components.PokemonSelector id={pokedex.entries[i]} onClick={props.onSelect} key={i}/>)
	}

	return (
		<div className="flex-row space-x-2 space-y-2">
			{components}
		</div>
	);
}