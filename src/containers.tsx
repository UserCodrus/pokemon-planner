'use client';

import { ReactElement, useContext, useMemo } from "react";

import * as Components from "./components";
import * as Data from "./data";
import Pokedex from "../data/pokedex.json";
import { GameContext } from "./reducer";

const party_size = 6;

/**
 * A component that contains the user's currently selected party
 */
export function PartyDisplay(props: {pokemon: Data.TeamSlot[], abilities: number[]}): ReactElement
{
	const game = useContext(GameContext);

	const components: ReactElement[] = [];
	for (let i = 0; i < party_size; ++i)
	{
		if (i < props.pokemon.length)
			components.push(<Components.PartyMember generation={game!.generation} pokemon={props.pokemon[i]} ability={props.abilities[i]} key={i} />);
		else
			components.push(<Components.PartyMember generation={game!.generation} key={i} />);
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
function PokedexGroup(props: {pokedex: typeof Pokedex[0], typeFilter: boolean[], nameFilter: string, pokemon: Data.TeamSlot[]}): ReactElement
{
	const game = useContext(GameContext);

	// Create a set of selector components for each pokemon in the pokedex
	const components: ReactElement[] = [];
	for (let i=0; i < props.pokedex.entries.length; ++i)
	{
		const pokemon = Data.getPokemon(game!.generation, props.pokedex.entries[i][0], props.pokedex.entries[i][1]);

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
		for (const selection of props.pokemon)
		{
			if (selection.id === props.pokedex.entries[i][0] && selection.form === props.pokedex.entries[i][1])
			{
				selected = true;
				break;
			}
		}

		components.push(<Components.PokemonSelector generation={game!.generation} id={props.pokedex.entries[i][0]} form={props.pokedex.entries[i][1]} selected={selected} key={i}/>);
	}

	return (
		<div className="text-center">
			<div className="panel text-lg p-2 mb-2 min-w-1/4 inline-block">{props.pokedex.name}</div>
			<div className="flex flex-row flex-wrap justify-center gap-2">
				{components}
			</div>
		</div>
	);
}

/**
 * A component that contains a set of pokedex displays
 */
export function PokedexDisplay(props: {typeFilter: boolean[], nameFilter: string, pokemon: Data.TeamSlot[]}): ReactElement
{
	const game = useContext(GameContext);

	const components: ReactElement[] = [];
	for (let i = 0; i < game!.pokedexes.length; ++i)
	{
		// Find the pokedex with the id matching the provided prop
		let pokedex_data: typeof Pokedex[0] | undefined;
		for (const dex_data of Pokedex)
		{
			if (dex_data.id === game!.pokedexes[i])
			{
				pokedex_data = dex_data;
				break;
			}
		}

		if (pokedex_data)
		{
			components.push(<PokedexGroup pokedex={pokedex_data} typeFilter={props.typeFilter} nameFilter={props.nameFilter} pokemon={props.pokemon} key={i} />)
		}
	}

	return (
		<div className="flex flex-col gap-2">
			{components}
		</div>
	);
}

/**
 * A component containing filters toggles for selectable pokemon
 */
export function FilterBar(props: {typeFilter: boolean[], name: string, onClickType: Components.TypeFilterCallback, onChangeText: Components.NameFilterCallback}): ReactElement
{
	const game = useContext(GameContext);

	// Create a full set of filter buttons
	const type_buttons: ReactElement[] = [];
	for (let i=0; i<Data.getNumTypes(); ++i)
	{
		if (Data.validType(game!.generation, i))
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
export function PartyAnalysis(props: {pokemon: Data.TeamSlot[], abilities: number[]}): ReactElement
{
	const game = useContext(GameContext);

	// Calculate the type advantages and disadvantages of the team
	const coverage: Data.TeamSlot[][] = [];
	const advantages: Data.TeamSlot[][] = [];
	const weaknesses: Data.TeamSlot[][] = [];

	for (let type_id = 0; type_id < Data.getNumTypes(); ++type_id)
	{
		coverage.push([]);
		advantages.push([]);
		weaknesses.push([]);

		for (let i = 0; i < props.pokemon.length; ++i)
		{
			const pokemon = Data.getPokemon(game!.generation, props.pokemon[i].id, props.pokemon[i].form);
			const ability = Data.getAbility(Data.getPokemonAbilities(game!.generation, props.pokemon[i].id, props.pokemon[i].form)[props.abilities[i]]);

			// Calculate offensive advantages for the pokemon
			let stab_advantage = false;
			for (const type of pokemon.types)
			{
				if (Data.getTypeAdvantage(game!.generation, type, [type_id]) > 1)
					stab_advantage = true;
			}
			if (stab_advantage)
			{
				coverage[coverage.length-1].push(props.pokemon[i]);
			}

			// Check for defensive strengths or weaknesses for the pokemon
			let defense_multiplier = Data.getTypeAdvantage(game!.generation, type_id, pokemon.types);

			// Apply ability bonuses
			if (ability.defense && game!.generation > 2)
			{
				for (const type of ability.defense.types)
				{
					if (type === type_id)
						if (!ability.defense.generation || ability.defense.generation >= game!.generation)
							defense_multiplier *= ability.defense.multiplier;
				}
			}

			if (defense_multiplier > 1)
			{
				weaknesses[weaknesses.length-1].push(props.pokemon[i]);
			}
			else if (defense_multiplier < 1)
			{
				advantages[advantages.length-1].push(props.pokemon[i]);
			}
		}
	}
	
	// Create a set of coverage components for each type available
	const components: ReactElement[] = [];
	for (let i = 0; i < Data.getNumTypes(); ++i)
	{
		if (Data.validType(game!.generation, i))
			components.push(<Components.Coverage type={i} coverage={coverage[i]} advantages={advantages[i]} weaknesses={weaknesses[i]} key={i} />)
	}

	return (
		<div className="panel p-4 flex flex-row flex-wrap justify-center gap-2">
			{components}
		</div>
	);
}