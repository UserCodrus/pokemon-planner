'use client';

import { ReactElement, useMemo } from "react";

import * as Components from "./components";
import * as Data from "./data";
import Pokedex from "../data/pokedex.json";

const party_size = 6;

/**
 * A component that contains the user's currently selected party
 */
export function PartyDisplay(props: {generation: number, pokemon: Components.SelectedPokemon[], onSelect: Components.SelectionCallback, onSwitchAbility: Components.AbilityCallback}): ReactElement
{
	const components: ReactElement[] = [];
	for (let i=0; i < props.pokemon.length; ++i)
	{
		components.push(<Components.PartyMember generation={props.generation} pokemon={props.pokemon[i]} key={i} cancelCallback={props.onSelect} abilityCallback={props.onSwitchAbility}/>)
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
export function PokedexDisplay(props: {generation: number, pokedex: string, selectedPokemon: Components.SelectedPokemon[], typeFilter: boolean[], nameFilter: string, onSelect: Components.SelectionCallback}): ReactElement
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
		const pokemon = Data.getPokemon(props.generation, pokedex.entries[i]);

		// Determine if the pokemon will be visible with the selected type filters
		let visible = false;
		for (const pokemon_type of pokemon.types)
		{
			if (props.typeFilter[pokemon_type])
			{
				visible = true;
				break;
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

		components.push(<Components.PokemonSelector generation={props.generation} id={pokedex.entries[i]} selected={selected} onClick={props.onSelect} key={i}/>)
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
export function FilterBar(props: {generation: number, typeFilter: boolean[], name: string, onClickType: Components.TypeFilterCallback, onChangeText: Components.NameFilterCallback}): ReactElement
{
	// Create a full set of filter buttons
	const type_buttons: ReactElement[] = [];
	for (let i=0; i<Data.getNumTypes(); ++i)
	{
		if (Data.validType(props.generation, i))
			type_buttons.push(<Components.TypeFilterButton type={i} active={props.typeFilter[i]} onClick={props.onClickType} key={i} />)
	}

	return (
		<div className="panel p-2 flex flex-row flex-grow gap-1">
			<div className="flex flex-row gap-1">{type_buttons}</div>
			<Components.NameFilterBox text={props.name} onChange={props.onChangeText} />
		</div>
	);
}

/**
 * A component that displays the party's advantages and disadvantages
 */
export function PartyAnalysis(props: {generation: number, selectedPokemon: Components.SelectedPokemon[]}): ReactElement
{
	// Calculate the type advantages and disadvantages of the team
	const coverage: Components.SelectedPokemon[][] = [];
	const advantages: Components.SelectedPokemon[][] = [];
	const weaknesses: Components.SelectedPokemon[][] = [];

	for (let i = 0; i < Data.getNumTypes(); ++i)
	{
		coverage.push([]);
		advantages.push([]);
		weaknesses.push([]);

		for (const pokemon_selection of props.selectedPokemon)
		{
			const pokemon = Data.getPokemon(props.generation, pokemon_selection.id, pokemon_selection.form);
			const ability = Data.getAbility(Data.getPokemonAbilities(props.generation, pokemon_selection.id, pokemon_selection.form)[pokemon_selection.ability]);

			// Calculate offensive advantages for the pokemon
			let stab_advantage = false;
			for (const type of pokemon.types)
			{
				if (Data.getTypeAdvantage(props.generation, type, [i]) > 1)
					stab_advantage = true;
			}
			if (stab_advantage)
			{
				coverage[coverage.length-1].push(pokemon_selection);
			}

			// Check for defensive strengths or weaknesses for the pokemon
			let defense_multiplier = Data.getTypeAdvantage(props.generation, i, pokemon.types);

			// Apply ability bonuses
			if (ability.defense && props.generation > 2)
			{
				for (const type of ability.defense.types)
				{
					if (type === i)
						if (!ability.defense.generation || ability.defense.generation >= props.generation)
							defense_multiplier *= ability.defense.multiplier;
				}
			}

			if (defense_multiplier > 1)
			{
				weaknesses[weaknesses.length-1].push(pokemon_selection);
			}
			else if (defense_multiplier < 1)
			{
				advantages[advantages.length-1].push(pokemon_selection);
			}
		}
	}
	
	// Create a set of coverage components for each type available
	const components: ReactElement[] = [];
	for (let i=0; i<Data.getNumTypes(); ++i)
	{
		if (Data.validType(props.generation, i))
			components.push(<Components.Coverage type={i} coverage={coverage[i]} advantages={advantages[i]} weaknesses={weaknesses[i]} key={i} />)
	}

	return (
		<div className="panel p-4 flex flex-row flex-wrap justify-center gap-2">
			{components}
		</div>
	);
}

/**
 * A set of components to change the currently selected game
 */
export function GameSelector(props: {selectionCallback: Components.GameCallback}): ReactElement
{
	// Create a set of pokedex selector components
	const components: ReactElement[] = [];
	for (let i = 0; i < Data.game_list.length; ++i)
	{
		components.push(<Components.PokedexSelector game={Data.game_list[i]} selectionCallback={props.selectionCallback} key={i} />);
	}

	return (
		<div className="flex flex-row flex-wrap gap-2 justify-evenly">
			{components}
		</div>
	);
}