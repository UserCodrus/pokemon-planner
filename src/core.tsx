'use client';

import { ReactElement, useState } from "react";

import * as Containers from "./containers";
import * as Data from "./data";

/**
 * The main component for the app
 */
export function App(): ReactElement
{
	const [selectedPokemon, setSelectedPokemon] = useState<Containers.SelectedPokemon[]>([]);
	const [typeFilter, setTypeFilter] = useState<string[]>(Data.types.slice());
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
	function toggleTypeFilter(type: string)
	{
		// Toggle all the types on or off if all is specified
		if (type === "all")
		{
			if (typeFilter.length < Data.types.length)
			{
				setTypeFilter(Data.types.slice());
				return;
			}
			else
			{
				setTypeFilter([]);
				return;
			}
		}

		// Check to see if the type is in the whitelist and remove it
		const filter = typeFilter.slice();
		for (let i=0; i<filter.length; ++i)
		{
			if (filter[i] === type)
			{
				filter.splice(i, 1);
				setTypeFilter(filter);
				return;
			}
		}

		// Add the type to the filter whitelist
		filter.push(type);
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
			<Containers.FilterBar types={typeFilter} name={nameFilter} onClickType={toggleTypeFilter} onChangeText={setNameFilter} />
			<Containers.PokedexDisplay pokedex="hoenn" selectedPokemon={selectedPokemon} typeFilter={typeFilter} nameFilter={nameFilter} onSelect={selectPokemon} />
		</div>
	);
}