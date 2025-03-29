'use client';

import { ReactElement } from "react";

import * as Components from "./components";
import * as Data from "./data";
import Pokedex from "../data/pokedex.json";
import Pokemon from "../data/pokemon.json";

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
		<div className="flex flex-row gap-2 relative">
			{components}
		</div>
	);
}

/**
 * A component that contains all selectable pokemon from a given pokedex
 */
export function PokedexDisplay(props: {pokedex: string, selectedPokemon: SelectedPokemon[], typeFilter: string[], nameFilter: string, onSelect: Components.SelectionCallback}): ReactElement
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

	// Create a set of selector components for each pokemon in the pokedex
	const components: ReactElement[] = [];
	for (let i=0; i < pokedex.entries.length; ++i)
	{
		const pokemon = Pokemon[pokedex.entries[i]];

		// Determine if the pokemon will be visible with the selected type filters
		let visible = false;
		for (const filter_type of props.typeFilter)
		{
			for (const pokemon_type of pokemon.forms[0].types)
			{
				if (pokemon_type === filter_type)
				{
					visible = true;
					break;
				}
			}
		}

		if (!visible)
			continue;

		// Check the pokemon's name against the name filters
		if (props.nameFilter)
		{
			const name = pokemon.name.toLowerCase();
			if (!name.includes(props.nameFilter))
				continue;
		}

		// Determine if the pokemon has been selected
		let selected = false;
		for (const selection of props.selectedPokemon)
		{
			if (selection.id === pokemon.id)
			{
				selected = true;
				break;
			}
		}

		components.push(<Components.PokemonSelector id={pokedex.entries[i]} selected={selected} onClick={props.onSelect} key={i}/>)
	}

	return (
		<div className="flex flex-row flex-wrap justify-center gap-2">
			{components}
		</div>
	);
}

/**
 * A component containing filters toggles for selectable pokemon
 */
export function FilterBar(props: {types: string[], name: string, onClickType: Components.TypeFilterCallback, onChangeText: Components.NameFilterCallback}): ReactElement
{
	// Create a full set of filter buttons
	const type_buttons: ReactElement[] = [];
	for (let i=0; i<Data.types.length; ++i)
	{
		// Check to see if the given type is in the filter whitelist
		let enabled = false;
		for (const type of props.types)
		{
			if (type === Data.types[i])
			{
				enabled = true;
				break;
			}
		}

		type_buttons.push(<Components.TypeFilterButton type={Data.types[i]} active={enabled} onClick={props.onClickType} key={i} />)
	}

	return (
		<div className="panel p-2 flex flex-row flex-grow gap-1">
			<div className="flex flex-row gap-1">{type_buttons}</div>
			<Components.NameFilterBox text={props.name} onChange={props.onChangeText} />
		</div>
	);
}