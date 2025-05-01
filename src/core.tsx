'use client';

import { ReactElement, useState, Suspense } from "react";

import * as Components from "./components";
import * as Containers from "./containers";
import * as Data from "./data";
import { useSearchParams } from "next/navigation";

/**
 * The core component of the app, responsible for routing between different views
 */
export function App(): ReactElement
{
	// Get the current pokedex for the app using the url fragment
	const location = useSearchParams();
	let selectedGame: Data.Game | undefined;
	for (const game of Data.game_list)
	{
		if (game.id === location.get("game"))
		{
			selectedGame = game;
			break;
		}
	}

	if (selectedGame)
	{
		return (
			<Planner />
		);
	}
	else
	{
		return (
			<Selector />
		);
	}
}

/**
 * The pokemon planner view
 */
export function Planner(): ReactElement
{
	const [selectedPokemon, setSelectedPokemon] = useState<Data.TeamSlot[]>([]);
	const [typeFilter, setTypeFilter] = useState<boolean[]>(Array(Data.getNumTypes()).fill(true));
	const [nameFilter, setNameFilter] = useState<string>("");

	// Get the current pokedex for the app using the url fragment
	const location = useSearchParams();
	let selectedGame: Data.Game = Data.game_list[0];
	for (const game of Data.game_list)
	{
		if (game.id === location.get("game"))
		{
			selectedGame = game;
			break;
		}
	}

	// Select or deselect a pokemon for the current party
	function selectPokemon(id: number, form?: number)
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
			pokemon.push({id: id, form: form, ability: 0});
			setSelectedPokemon(pokemon);
		}
	}

	// Change a selected pokemon's active ability
	function swapAbility(selected_pokemon: Data.TeamSlot)
	{
		const party_pokemon = selectedPokemon.slice();
		for (const pokemon of party_pokemon)
		{
			if (pokemon === selected_pokemon)
			{
				// Cycle between ability slots, skipping slots with no ability
				const abilities = Data.getPokemonAbilities(selectedGame.generation, pokemon.id, pokemon.form);
				const ability_slots = selectedGame.generation > 4 ? 2 : 1;
				do
				{
					pokemon.ability++;
					if (pokemon.ability > ability_slots)
						pokemon.ability = 0;
				} while (!abilities[pokemon.ability]);

				setSelectedPokemon(party_pokemon);
				return;
			}
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

	return (
		<div className="flex flex-col w-4/5 py-8 gap-4 items-center">
			<Containers.PartyDisplay generation={selectedGame.generation} pokemon={selectedPokemon} onSelect={selectPokemon} onSwitchAbility={swapAbility} />
			<Containers.PartyAnalysis generation={selectedGame.generation} selectedPokemon={selectedPokemon} />
			<Containers.FilterBar generation={selectedGame.generation} typeFilter={typeFilter} name={nameFilter} onClickType={toggleTypeFilter} onChangeText={changeNameFilter} />
			<Containers.PokedexDisplay generation={selectedGame.generation} pokedexes={selectedGame.pokedexes} selectedPokemon={selectedPokemon} typeFilter={typeFilter} nameFilter={nameFilter} onSelect={selectPokemon} />
		</div>
	);
}

/**
 * The view that lets the player select a game to use
 */
export function Selector(): ReactElement
{
	// Create a set of pokedex selector components
	const components: ReactElement[] = [];
	for (let i = 0; i <= 9; ++i)
	{
		// Create a single row for each generation
		const inner_components: ReactElement[] = [];
		if (i === 0)
		{
			// Put the national dex at the top
			inner_components.push(<Components.PokedexSelector game={Data.game_list[0]} key={0} />);
		}
		else
		{
			let key = 0;
			for (const game of Data.game_list)
			{
				if (game.generation === i && game.id !== "nat")
				{
					inner_components.push(<Components.PokedexSelector game={game} key={key} />);
					++key;
					continue;
				}
			}
		}


		components.push(
			<div key={i} className="flex flex-row gap-2 justify-center">
				{inner_components}
			</div>
		);
	}

	return (
		<div className="flex flex-col flex-wrap gap-2 justify-evenly">
			{components}
		</div>
	);
}