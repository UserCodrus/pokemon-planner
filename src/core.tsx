'use client';

import { ReactElement, useState } from "react";

import * as Containers from "./containers";

/**
 * The main component for the app
 */
export function App(): ReactElement
{
	const [selectedPokemon, setSelectedPokemon] = useState<Containers.SelectedPokemon[]>([]);

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

	return (
		<div className="flex flex-col w-4/5 py-8 space-y-8 items-center">
			<Containers.PartyDisplay pokemon={selectedPokemon} onSelect={selectPokemon} />
			<Containers.PokedexDisplay pokedex="hoenn" onSelect={selectPokemon} />
		</div>
	);
}