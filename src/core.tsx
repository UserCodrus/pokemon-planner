'use client';

import { ReactElement, useState } from "react";

import * as Components from "./components";
import * as Containers from "./containers";
import * as Data from "./data";

/**
 * The main component for the app
 */
export function App(): ReactElement
{
	const [selectedGame, setSelectedGame] = useState<Data.GameData>(Data.game_list[18])
	const [selectedPokemon, setSelectedPokemon] = useState<Components.SelectedPokemon[]>([]);
	const [typeFilter, setTypeFilter] = useState<boolean[]>(Array(Data.getNumTypes()).fill(true));
	const [nameFilter, setNameFilter] = useState<string>("");

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
	function swapAbility(selected_pokemon: Components.SelectedPokemon)
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

	// Change the currently active generation
	function swapGeneration(new_generation: number)
	{
		// Make sure none of the party pokemon have invalid abilites
		const party_pokemon = selectedPokemon.slice();
		const ability_slots = new_generation > 4 ? 2 : 1;
		let update = false;

		for (const pokemon of party_pokemon)
		{
			const abilities = Data.getPokemonAbilities(new_generation, pokemon.id, pokemon.form);
			if (!abilities[pokemon.ability] || pokemon.ability > ability_slots)
			{
				// Cycle between ability slots, skipping slots with no ability
				do
				{
					pokemon.ability++;
					if (pokemon.ability > ability_slots)
						pokemon.ability = 0;
				} while (!abilities[pokemon.ability]);
				update = true;
			}
		}

		if (update)
			setSelectedPokemon(party_pokemon);

		//setGeneration(new_generation);
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

	// Set the active game data
	function selectGame(game: Data.GameData)
	{
		// Reset all the app settings when the selected game is changed
		setSelectedPokemon([]);
		setTypeFilter(Array(Data.getNumTypes()).fill(true));
		setNameFilter("");

		setSelectedGame(game);
	}

	return (
		<div className="flex flex-col w-4/5 py-8 gap-4 items-center">
			<Containers.PartyDisplay generation={selectedGame.generation} pokemon={selectedPokemon} onSelect={selectPokemon} onSwitchAbility={swapAbility} />
			<Containers.PartyAnalysis generation={selectedGame.generation} selectedPokemon={selectedPokemon} />
			<Containers.FilterBar generation={selectedGame.generation} typeFilter={typeFilter} name={nameFilter} onClickType={toggleTypeFilter} onChangeText={changeNameFilter} />
			<Containers.PokedexDisplay generation={selectedGame.generation} pokedex={selectedGame.pokedexes[0]} selectedPokemon={selectedPokemon} typeFilter={typeFilter} nameFilter={nameFilter} onSelect={selectPokemon} />
			<Containers.GameSelector selectionCallback={selectGame} />
		</div>
	);
}