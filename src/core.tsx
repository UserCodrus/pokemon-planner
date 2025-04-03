'use client';

import { ReactElement, useMemo, useState } from "react";

import * as Containers from "./containers";
import * as Data from "./data";

import Pokemon from "../data/pokemon.json";
import Types from "../data/types.json";

type TypeAdvantage = {
	offense: {
		advantage: number,
		disadvantage: number
	},
	defense: {
		advantage: number,
		disadvantage: number
	}
}

/**
 * The main component for the app
 */
export function App(): ReactElement
{
	const [selectedPokemon, setSelectedPokemon] = useState<Containers.SelectedPokemon[]>([]);
	const [typeFilter, setTypeFilter] = useState<boolean[]>(Array(Data.types.length).fill(true));
	const [nameFilter, setNameFilter] = useState<string>("");

	// Select or deselect a pokemon for the current party
	function selectPokemon(id: number, form?: string)
	{
		const pokemon = selectedPokemon.slice();

		// Remove the pokemon from the party if it has already been added
		for (let i=0; i < pokemon.length; ++i)
		{
			if (pokemon[i].id === id && pokemon[i].form === form)
			{
				pokemon.splice(i, 1);
				setSelectedPokemon(pokemon);
				return;
			}
		}

		// Add the pokemon to the party
		if (selectedPokemon.length < 6)
		{
			pokemon.push({id, form});
			setSelectedPokemon(pokemon);
		}
	}

	// Activate or deactivate a type filter option
	function toggleTypeFilter(type: number)
	{
		// Toggle all the types on or off if all is specified
		if (type === -1)
		{
			// If any types are disabled, enable everything
			for (const filter of typeFilter)
			{
				if (!filter)
				{
					setTypeFilter(Array(Data.types.length).fill(true));
				}
			}

			// If everything is enabled, disable everything
			setTypeFilter(Array(Data.types.length).fill(false));
			return;
		}

		// Toggle the state of the specified type filter
		const filter = typeFilter.slice();
		filter[type] = !filter[type];
		setTypeFilter(filter);
	}

	// Set the name filter for selectable pokemon
	function changeNameFilter(filter: string)
	{
		setNameFilter(filter);
	}

	return (
		<div className="flex flex-col w-4/5 py-8 gap-4 items-center">
			<Containers.PartyDisplay pokemon={selectedPokemon} onSelect={selectPokemon} />
			<Containers.FilterBar typeFilter={typeFilter} name={nameFilter} onClickType={toggleTypeFilter} onChangeText={changeNameFilter} />
			<Containers.PokedexDisplay pokedex="hoenn" selectedPokemon={selectedPokemon} typeFilter={typeFilter} nameFilter={nameFilter} onSelect={selectPokemon} />
		</div>
	);
}