'use client';

import { MouseEvent as ReactMouseEvent, DragEvent as ReactDragEvent, ReactElement, ReactNode, memo, useContext, useEffect, useRef, useState } from "react";

import * as Components from "./components";
import * as Data from "./data";
import Pokedex from "../data/pokedex.json";
import { DispatchContext, Task } from "./reducer";
import { ModalContext } from "./modal";
import Tutorials from "./tutorials";

const party_size = 6;
const draw_order = [0, 1, 2, 3, 4, 5];

/**
 * A component that contains the user's currently selected party
 */
export function PartyDisplay(props: {pokemon: Data.TeamSlot[], abilities: number[], game: Data.Game}): ReactElement
{
	const dispatch = useContext(DispatchContext);
	const [dragData, setDragData] = useState({
		target: 0,
		order: draw_order.slice()
	});

	function dragStart(index: number) {
		// Set the targeted component
		setDragData({
			...dragData,
			target: index
		});
	}

	function dragOver(event: ReactDragEvent<Element>, index: number) {
		event.preventDefault();

		// Reorder the draw array based on the location of the dragged component
		const draw_array = draw_order.slice();
		draw_array.splice(dragData.target, 1);
		draw_array.splice(index, 0, dragData.target);

		setDragData({
			...dragData,
			order: draw_array
		});
	}

	function dragEnd() {
		// Reorder the party based on the drag and drop ordering
		dispatch({
			type: Task.reorder,
			data: dragData.order
		});
		
		setDragData({
			target: 0,
			order: draw_order.slice()
		});
	}

	function dragLeave() {
		// Reset drag and drop ordering when the user isn't dragging over a component
		setDragData({
			...dragData,
			order: draw_order.slice()
		});
	}

	// Generate the party components
	const components: ReactElement[] = [];
	for (let i = 0; i < party_size; ++i)
	{
		if (dragData.order[i] < props.pokemon.length)
			components.push(<Components.PartyMember
				game={props.game} pokemon={props.pokemon[dragData.order[i]]} ability={props.abilities[dragData.order[i]]} key={i}
				onDragStart={() => dragStart(dragData.order[i])} onDragOver={(e) => dragOver(e, i)} onDrop={() => dragEnd()} onDragLeave={() => dragLeave()}
			/>);
		else
			components.push(<Components.PartyMember game={props.game} key={i} />);
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
	const openModal = useContext(ModalContext);

	// Get the game data for the game the party was made for
	const game = Data.getGame(props.party.game);

	// Select the team when the component is left clicked
	function handleLeftClick(event: ReactMouseEvent<HTMLDivElement>) {
		dispatch({
			type: Task.select_team,
			data: props.party.id
		});
	}
	// Delete the team when the component is right clicked and the user confirms the modal popup
	function handleRightClick(event: ReactMouseEvent<HTMLDivElement>) {
		event.preventDefault();
		openModal({
			message: "Are you sure you wish to delete this team?\nThis action cannot be undone.",
			buttons: [
				{
					label: "Confirm",
					callback: () => {
						dispatch({
							type: Task.delete_team,
							data: props.party.id
						});
					}
				},
				{ label: "Cancel" }
			]
		});
	}

	// Create a set of party components
	const components: ReactElement[] = [];
	for (let i = 0; i < props.party.pokemon.length; ++i)
	{
		components.push(<Components.PartyMemberSmall generation={game!.generation} pokemon={props.party.pokemon[i]} key={i} />);
	}

	return (
		<div tabIndex={0} className="panel clickable text-center" onClick={(e) => handleLeftClick(e)} onContextMenu={(e) => handleRightClick(e)}>
			<div>{props.party.name}</div>
			<div>{"Generation " + Data.getRomanNumeral(game!.generation - 1) + ": " + game!.name}</div>
			<div className="flex flex-row">{components}</div>
		</div>
	);
}

/**
 * A component that contains all selectable pokemon from a given pokedex
 */
function PokedexGroup(props: {pokedex: typeof Pokedex[0], game: Data.Game, typeFilter: boolean[], nameFilter: string, versionFilter: number, pokemon: Data.TeamSlot[]}): ReactElement
{
	const version = props.versionFilter > -1 ? props.game.versions[props.versionFilter] : null;
	const limit = (version && version.limit) ? version.limit : props.pokedex.entries.length;

	// Create a set of selector components for each pokemon in the pokedex
	const components: ReactElement[] = [];
	pokemon: for (let i = 0; i < limit; ++i)
	{
		const pokemon = Data.getPokemon(props.game.generation, props.pokedex.entries[i][0], props.pokedex.entries[i][1]);

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

		// Check the pokemon against version filters
		if (version)
		{
			if (version.blacklist)
			{
				for (const id of version.blacklist)
				{
					if (id === pokemon.id)
						continue pokemon;
				}
			}
			if (version.formlist)
			{
				for (const form of version.formlist)
				{
					if (form[0] === props.pokedex.entries[i][0] && form[1] === props.pokedex.entries[i][1])
						continue pokemon;
				}
			}
		}

		// Check the pokemon's name against the name filters
		if (props.nameFilter)
		{
			const name = pokemon.name.toLowerCase();
			const form = pokemon.form.toLowerCase();
			if (!name.includes(props.nameFilter) && !form.includes(props.nameFilter))
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

		components.push(<Components.PokemonSelector generation={props.game.generation} id={props.pokedex.entries[i][0]} form={props.pokedex.entries[i][1]} selected={selected} key={i}/>);
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
export const PokedexDisplay = memo(function PokedexDisplay(props: {game: Data.Game, typeFilter: boolean[], nameFilter: string, versionFilter: number, pokemon: Data.TeamSlot[]}): ReactElement
{
	const components: ReactElement[] = [];
	for (let i = 0; i < props.game.pokedexes.length; ++i)
	{
		// Find the pokedex with the id matching the provided prop
		let pokedex_data: typeof Pokedex[0] | undefined;
		for (const dex_data of Pokedex)
		{
			if (dex_data.id === props.game.pokedexes[i])
			{
				pokedex_data = dex_data;
				break;
			}
		}

		if (pokedex_data)
		{
			components.push(<PokedexGroup pokedex={pokedex_data} game={props.game} typeFilter={props.typeFilter} nameFilter={props.nameFilter.toLowerCase()} versionFilter={props.versionFilter} pokemon={props.pokemon} key={i} />)
		}
	}

	return (
		<div className="flex flex-col gap-2 min-h-[90vh]">
			{components}
		</div>
	);
})

/**
 * A component containing filters toggles for selectable pokemon
 */
export function FilterBar(props: {game: Data.Game, typeFilter: boolean[], name: string, version: number, onClickType: Components.TypeFilterCallback, onChangeText: Components.NameFilterCallback, onSelectVersion: Components.VersionFilterCallback}): ReactElement
{
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
		if (Data.validType(props.game.generation, i))
			type_buttons.push(<Components.TypeFilterButton type={i} active={props.typeFilter[i]} onClick={props.onClickType} key={i+1} />)
	}

	return (
		<div className="panel flex flex-row flex-grow gap-1 justify-evenly items-center">
			<div className="flex flex-row gap-1 flex-wrap justify-evenly">{type_buttons}</div>
			<div className="flex flex-row gap-3 flex-wrap items-center justify-center">
				<PopupBox text={props.version > -1 ? props.game.versions[props.version].name : "All"}>
					<Components.VersionSelector game={props.game} version={props.version} onSelect={props.onSelectVersion} />
				</PopupBox>
				<Components.NameFilterBox text={props.name} onChange={props.onChangeText} />
			</div>
			<div className="absolute right-[8px] top-[8px]"><Components.TutorialButton message={Tutorials.filter} /></div>
		</div>
	);
}

/**
 * Helper function to calculate type advantages and disadvantages for a team
 */
function partyCoverage(type_id: number, party: Data.TeamSlot[], abilities: number[], game: Data.Game): Data.TeamSlot[][]
{
	const offense_advantages: Data.TeamSlot[] = [];
	const offense_weaknesses: Data.TeamSlot[] = [];
	const defense_advantages: Data.TeamSlot[] = [];
	const defense_weaknesses: Data.TeamSlot[] = [];

	// Check each party pokemon against the current type
	for (let i = 0; i < party.length; ++i)
	{
		const pokemon = Data.getPokemon(game.generation, party[i].id, party[i].form);
		const ability = Data.getAbility(Data.getPokemonAbilities(game.generation, party[i].id, party[i].form)[abilities[i]]);

		// Calculate the maximum damage multiplier for the pokemon's same type attacks against the current type
		let stab_multiplier = 0.5;
		for (const type of pokemon.types)
		{
			const multiplier = Data.getTypeAdvantage(game.generation, type, [type_id]);
			if (multiplier > stab_multiplier)
				stab_multiplier = multiplier;
		}

		if (stab_multiplier > 1)
			offense_advantages.push(party[i]);
		else if (stab_multiplier < 1)
			offense_weaknesses.push(party[i]);

		// Calculate the pokemon's defensive multiplier against the current type
		let defense_multiplier = Data.getTypeAdvantage(game.generation, type_id, pokemon.types);

		// Apply ability bonuses
		if (ability.defense && game.generation > 2)
		{
			for (const type of ability.defense.types)
			{
				if (type === type_id)
					if (!ability.defense.generation || ability.defense.generation >= game.generation)
						defense_multiplier *= ability.defense.multiplier;
			}
		}

		if (defense_multiplier > 1)
			defense_weaknesses.push(party[i]);
		else if (defense_multiplier < 1)
			defense_advantages.push(party[i]);
	}

	return [offense_advantages, offense_weaknesses, defense_advantages, defense_weaknesses];
}

/**
 * A component that displays the party's advantages and disadvantages
 */
export function PartyAnalysis(props: {team: Data.TeamSlot[], compareTeam?: Data.TeamSlot[], abilities: number[], compareAbilities?: number[], game: Data.Game}): ReactElement
{
	// Create a component to display the team's comparison to each type
	const components: ReactElement[] = [];
	for (let type_id = 0; type_id < Data.getNumTypes(); ++type_id)
	{
		if (Data.validType(props.game.generation, type_id))
		{
			// Calculate the team's advantages and disadvantages against the type
			const [offense_advantages, offense_weaknesses, defense_advantages, defense_weaknesses] = partyCoverage(type_id, props.team, props.abilities, props.game);

			// Apply negative highlights if the team is weak against the type
			let offense_highlight = Math.min(offense_advantages.length - offense_weaknesses.length, 0);
			let defense_highlight = Math.min(defense_advantages.length - defense_weaknesses.length, 0);

			// Calculate the compared team's stats
			if (props.compareTeam && props.compareAbilities)
			{
				const [compare_offense_advantages, compare_offense_weaknesses, compare_defense_advantages, compare_defense_weaknesses] = partyCoverage(type_id, props.compareTeam, props.compareAbilities, props.game);

				// Replace highlights with positive highlights if the team is better than the compared team
				offense_highlight = (compare_offense_advantages.length - compare_offense_weaknesses.length) > (offense_advantages.length - offense_weaknesses.length) ? 0 : 1;
				defense_highlight = (compare_defense_advantages.length - compare_defense_weaknesses.length) > (defense_advantages.length - defense_weaknesses.length) ? 0 : 1;
			}
			
			components.push(<Components.Coverage type={type_id} key={type_id}
				offense={{advantage: offense_advantages, disadvantage: offense_weaknesses, highlight: offense_highlight}}
				defense={{advantage: defense_advantages, disadvantage: defense_weaknesses, highlight: defense_highlight}} />);
		}
	}

	return (
		<div className="panel flex flex-row flex-wrap justify-center gap-2">
			{components}
			<div className="absolute right-[8px] top-[8px]"><Components.TutorialButton message={Tutorials.analysis} /></div>
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
	const dispatch = useContext(DispatchContext);
	const openModal = useContext(ModalContext);
	const [menuOpen, setMenuOpen] = useState(false);

	if (menuOpen)
	{
		return (
			<MenuBox closeCallback={()=>{setMenuOpen(false)}}>
				<div className="flex flex-col gap-2">
					<Components.SidebarButton label="Home" icon="solar--home-2-bold"
						onClick={() => {
							dispatch({type: Task.home});
							setMenuOpen(false);
						}}
					/>
					<Components.SidebarButton label="Planner" icon="solar--notebook-square-bold"
						onClick={() => {
							dispatch({type: Task.select_team});
							setMenuOpen(false);
						}}
					/>
					<Components.SidebarButton label="Compare Teams" icon="solar--tuning-square-2-bold"
						onClick={() => {
							dispatch({type: Task.compare});
							setMenuOpen(false);
						}}
					/>
					<Components.SidebarButton label="Save Team" icon="solar--upload-square-bold"
						onClick={() => {
							openModal({
								message: "Do you wish to save this team?\nExisting saved data for this team will be overwritten.",
								buttons: [
									{ label: "Overwrite", callback: () => dispatch({ type: Task.save_current_team})},
									{ label: "Save as New", callback: () => dispatch({ type: Task.save_new_team})},
									{ label: "Cancel" }
								]
							});
							setMenuOpen(false);
						}}
					/>
					<Components.SidebarButton label="New Team" icon="solar--restart-square-bold"
						onClick={() => {
							openModal({
								message: "Do you wish to create a new team?\nUnsaved changes to the current team will be lost.",
								buttons: [
									{ label: "Confirm", callback: () => dispatch({ type: Task.new_team})},
									{ label: "Cancel" }
								]
							});
							setMenuOpen(false);
						}}
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

const icon_source = "/icons.svg";

/**
 * A component that displays a pop-up when clicked
 */
export function PopupBox(props: {text: string, children: ReactNode}): ReactElement
{
	const [open, setOpen] = useState(false);

	// Add a global listener to run the close callback when a clicking anywhere on the page
	useEffect(() => {
		const handleClick = () => { setOpen(false); }

		if (open)
		{
			document.addEventListener("click", handleClick);
			document.addEventListener("contextmenu", handleClick);
		}

		return () => {
			document.removeEventListener("click", handleClick);
			document.removeEventListener("contextmenu", handleClick);
		}
	}, [open]);

	return (
		<div className="relative">
			<div tabIndex={0} className="inner-panel cursor-pointer flex flex-row gap-1 items-center px-2 max-h-8" onClick={() => {setOpen(true)}}>
				<div className="min-w-32">{props.text}</div>
				<svg width={16} height={16}><use href={icon_source + "#solar--alt-arrow-down-outline"} /></svg>
			</div>
			{open && props.children}
		</div>
	)
}