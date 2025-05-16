'use client';

import { MouseEventHandler, ReactElement, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";

import * as Components from "./components";
import * as Data from "./data";
import Pokedex from "../data/pokedex.json";
import { DispatchContext, GameContext, Task } from "./reducer";

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
		<div className="flex flex-row flex-wrap gap-2 relative justify-between">
			{components}
		</div>
	);
}

/**
 * A container that displays a saved party and selects it by clicking
 */
export function PartySelector(props: {party: Data.Team}): ReactElement
{
	const dispatch = useContext(DispatchContext);

	// Get the game data for the game the party was made for
	let game: Data.Game | null = null;
	for (const game_data of Data.game_list)
	{
		if (game_data.id === props.party.game)
		{
			game = game_data;
			break;
		}
	}

	// Handle mouse clicks on the team
	function handleClick() {
		dispatch({
			type: Task.select_team,
			data: props.party.id
		});
	}

	// Create a set of party components
	const components: ReactElement[] = [];
	for (let i = 0; i < props.party.pokemon.length; ++i)
	{
		components.push(<Components.PartyMemberSmall generation={game!.generation} pokemon={props.party.pokemon[i]} key={i} />);
	}

	return (
		<div className="panel clickable text-center" onClick={() => handleClick()}>
			<div>{props.party.name}</div>
			<div>{"Generation " + Data.getRomanNumeral(game!.generation - 1) + ": " + game!.games}</div>
			<div className="flex flex-row">{components}</div>
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
			<div className="panel text-lg mb-2 min-w-1/4 inline-block">{props.pokedex.name}</div>
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

	// Determine if any filters are disabled for the all filter button
	let all_filter = true;
	for (const filter of props.typeFilter)
	{
		if (!filter)
		{
			all_filter = false;
			break;
		}
	}

	// Create a full set of filter buttons
	const type_buttons: ReactElement[] = [];
	type_buttons.push(<Components.AllFilterButton active={all_filter} onClick={props.onClickType} key={0} />);
	for (let i=0; i<Data.getNumTypes(); ++i)
	{
		if (Data.validType(game!.generation, i))
			type_buttons.push(<Components.TypeFilterButton type={i} active={props.typeFilter[i]} onClick={props.onClickType} key={i+1} />)
	}

	return (
		<div className="panel flex flex-row flex-grow gap-1 justify-evenly items-center">
			<div className="flex flex-row gap-1 flex-wrap justify-evenly">{type_buttons}</div>
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
		<div className="panel flex flex-row flex-wrap justify-center gap-2">
			{components}
		</div>
	);
}

/**
 * The container for the main menu
 */
export function MenuBox(props: {closeCallback: Function, children: ReactNode}): ReactElement
{
	// Add a global listener to run the close callback when a clicking outside the menu
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (!ref.current?.contains(e.target as Node))
				props.closeCallback();
		}
		document.addEventListener("click", handleClick);
		document.addEventListener("contextmenu", handleClick);

		return () => {
			document.removeEventListener("click", handleClick);
			document.removeEventListener("contextmenu", handleClick);
		}
	}, [ref]);
	
	return (
		<div className="sidemenu" ref={ref}>
			<div className="text-center text-lg p-2">Menu</div>
			{props.children}
		</div>
	);
}

/**
 * The sidebar menu
 */
export function PopupMenu(): ReactElement
{
	const [menuOpen, setMenuOpen] = useState(false);
	const dispatch = useContext(DispatchContext);

	const closeMenu = ()=>setMenuOpen(false);

	if (menuOpen)
	{
		return (
			<MenuBox closeCallback={()=>{setMenuOpen(false)}}>
				<div className="flex flex-col gap-2">
					<Components.SidebarButton label="Home" icon="solar--home-2-bold"
						tasks={[{label: "Confirm", task: Task.home}]}
						confirmation={"Are you sure you wish to return to the home screen?\nUnsaved changes to the current team will be lost."}
						menuCallback={closeMenu}
					/>
					<Components.SidebarButton label="Save Team" icon="solar--upload-square-bold"
						tasks={[{label: "Overwrite", task: Task.save_current_team}, {label: "Save as New", task: Task.save_new_team}]}
						confirmation={"Do you wish to save this team?\nExisting saved data for this team will be overwritten."}
						menuCallback={closeMenu}
					/>
					<Components.SidebarButton label="New Team" icon="solar--restart-square-bold"
						tasks={[{label: "Confirm", task: Task.new_team}]}
						confirmation={"Do you wish to create a new team?\nUnsaved changes to the current team will be lost."}
						menuCallback={closeMenu}
					/>
				</div>
			</MenuBox>
		);
	}
	else
	{
		return <Components.MenuButton openCallback={()=>{setMenuOpen(true)}} />
	}
}