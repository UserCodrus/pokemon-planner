'use client';

import { ReactElement, useMemo, useState } from "react";

import * as Components from "./components";
import * as Containers from "./containers";
import * as Data from "./data";

/**
 * The main component for the app
 */
export function App(): ReactElement
{
	const [generation, setGeneration] = useState<number>(9);
	const [selectedPokemon, setSelectedPokemon] = useState<Components.SelectedPokemon[]>([]);
	const [typeFilter, setTypeFilter] = useState<boolean[]>(Array(Data.getNumTypes()).fill(true));
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
					setTypeFilter(Array(Data.getNumTypes()).fill(true));
				}
			}

			// If everything is enabled, disable everything
			setTypeFilter(Array(Data.getNumTypes()).fill(false));
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

	// Calculate the type advantages and disadvantages of the team
	const [coverage, advantages, weaknesses] = useMemo(() => {
		const offense_advantages: Components.SelectedPokemon[][] = [];
		const defense_advantages: Components.SelectedPokemon[][] = [];
		const defense_disadvantages: Components.SelectedPokemon[][] = [];

		for (let i = 0; i < Data.getNumTypes(); ++i)
		{
			offense_advantages.push([]);
			defense_advantages.push([]);
			defense_disadvantages.push([]);

			for (const pokemon_selection of selectedPokemon)
			{
				const pokemon = Data.getPokemon(generation, pokemon_selection.id, pokemon_selection.form);

				// Calculate the defensive damage multiplier and check for offensive advantages
				let stab_advantage = false;
				let defense_multiplier = 1;
				for (const type of pokemon.types)
				{
					defense_multiplier *= Data.getTypeAdvantage(generation, i, type);

					if (Data.getTypeAdvantage(generation, type, i) > 1)
						stab_advantage = true;
				}

				// Push pokemon onto the arrays if they have advantages or disadvantages
				if (defense_multiplier > 1)
				{
					defense_disadvantages[defense_disadvantages.length-1].push(pokemon_selection);
				}
				else if (defense_multiplier < 1)
				{
					defense_advantages[defense_advantages.length-1].push(pokemon_selection);
				}

				if (stab_advantage)
				{
					offense_advantages[offense_advantages.length-1].push(pokemon_selection);
				}
			}
		}
		
		console.log(offense_advantages.length);
		console.log(defense_advantages.length);

		return [offense_advantages,	defense_advantages, defense_disadvantages];
	}, [selectedPokemon, generation]);

	// Create a set of test buttons for changing generation
	const test_buttons: ReactElement[] = [];
	for (let i = 0; i < 9; ++i)
	{
		test_buttons.push(<Components.TESTGenSelector gen={i+1} callback={(gen: number)=>setGeneration(gen)} key={i} />);
	}

	return (
		<div className="flex flex-col w-4/5 py-8 gap-4 items-center">
			<Containers.PartyDisplay generation={generation} pokemon={selectedPokemon} onSelect={selectPokemon} />
			<Containers.PartyAnalysis generation={generation} coverage={coverage} advantages={advantages} weaknesses={weaknesses} />
			<Containers.FilterBar generation={generation} typeFilter={typeFilter} name={nameFilter} onClickType={toggleTypeFilter} onChangeText={changeNameFilter} />
			<Containers.PokedexDisplay generation={generation} pokedex="hoenn" selectedPokemon={selectedPokemon} typeFilter={typeFilter} nameFilter={nameFilter} onSelect={selectPokemon} />
			<div className="flex flex-row gap-1">{test_buttons}</div>
		</div>
	);
}