'use client';

import { MouseEvent, ReactElement, useContext, useState, useEffect, DragEventHandler, useRef, FormEvent } from "react";
import Image from 'next/image'

import * as Data from "./data";
import Link from "next/link";
import { DispatchContext, UnsafeDataContext, Task } from "./reducer";
import { ModalContext } from "./modal";

export type SelectionCallback = (id: number, form?: number) => void;
export type AbilityCallback = (selectedPokemon: Data.TeamSlot) => void;
export type GameCallback = (game: Data.Game) => void;
export type BooleanFilterCallback = (index: number, single?: boolean) => void;
export type NameFilterCallback = (text: string) => void;
export type VersionFilterCallback = (version: number) => void;
export type PartySortCallback = (sort_option: PartySort) => void;

/**
 * Specify which party members in a team are strong or weak against a type
 */
export type TypeCoverage = {
	advantage: Data.TeamSlot[],
	disadvantage: Data.TeamSlot[],
	highlight: number
}

/**
 * A set of sorting data for saved parties
 */
export type PartySort = {
	label: string,
	sort: (a: Data.Team, b: Data.Team) => number
}

const enum CoverageStyle {
	neutral,
	advantage,
	weakness
}

export const sort_options: PartySort[] = [{
		label: "Date Updated",
		sort: (a, b) => {
			return b.updated.valueOf() - a.updated.valueOf();
		}
	}, {
		label: "Date Created",
		sort: (a, b) => {
			return b.created.valueOf() - a.created.valueOf();
		}
	}, {
		label: "Alphabetical",
		sort: (a, b) => a.name.localeCompare(b.name)
	}, {
		label: "Game Version",
		sort: (a, b) => {
			return Data.getGameOrder(a.game) - Data.getGameOrder(b.game);
		}
	}
];

/**
 * A component that displays a pokemon the user has selected for their party
 * @param props.id The national dex id of the pokemon that the panel will display
 * @param props.form The id of the form that the pokemon will use
 */
export function PartyMember(props: {game: Data.Game, pokemon?: Data.TeamSlot, ability?: number, onDragStart?: DragEventHandler, onDragOver?: DragEventHandler, onDragEnd?: DragEventHandler, onDragLeave?: DragEventHandler, onDrop?: DragEventHandler}): ReactElement
{
	const dispatch = useContext(DispatchContext);
	const size = 200;

	// Create images for the type displays and artwork, with fallbacks for empty party slots
	let name_text = "";
	let form_text = "";
	let ability_text = "";
	let hidden_ability = false;

	let art_alt = "Empty";
	let art_src = Data.default_image;
	const type_images: ReactElement[] = [];

	if (props.pokemon) {
		// Retrieve pokemon data
		const pokemon = Data.getPokemon(props.game.generation, props.pokemon.id, props.pokemon.form);
		name_text = pokemon.name;
		form_text = pokemon.form;

		for (let i=0; i < pokemon.types.length; ++i) {
			const src = Data.typeSpriteURL(pokemon.types[i]);
			type_images.push(<Image className="inline-flex min-w-[75px] lg:min-w-[100px]" src={src} width={100} height={20} draggable={false} alt={Data.getTypeName(pokemon.types[i])} key={i}/>)
		}

		art_src = pokemon.art;
		art_alt = pokemon.name;

		// Set the text for the ability line
		if (props.ability !== undefined && props.game.abilities) {
			const ability_set = Data.getPokemonAbilities(props.game.generation, props.pokemon.id, props.pokemon.form);
			const ability = Data.getAbility(ability_set[props.ability]);
	
			ability_text = ability.name;
			if (props.ability === 2)
				hidden_ability = true;
		}
	}

	// Set styling for the outer div
	let component_style = "panel flex flex-col items-center";
	if (props.pokemon)
		component_style += " clickable"

	// Handle mouse clicks
	function handleLeftClick(event: MouseEvent<HTMLDivElement>) {
		if (props.pokemon)
			dispatch({
				type: Task.swap_ability,
				data: props.pokemon
			});
	}

	function handleRightClick(event: MouseEvent<HTMLDivElement>) {
		event.preventDefault();
		if (props.pokemon)
			dispatch({
				type: Task.select_pokemon,
				data: props.pokemon
			});
	}

	// Create a key to force css animations to replay when the pokemon changes
	const component_key = props.pokemon ? props.pokemon.id * 100 + props.pokemon.form : 0;

	return (
		<div tabIndex={0} className={component_style} draggable={true} key={component_key}
			onClick={(e)=>handleLeftClick(e)} onContextMenu={(e)=>handleRightClick(e)}
			onDragStart={props.onDragStart} onDragOver={props.onDragOver} onDragEnd={props.onDragEnd} onDrop={props.onDrop} onDragLeave={props.onDragLeave}
		>
			<div className="text-center min-h-6">{name_text}</div>
			<div className="text-center text-secondary text-sm min-h-6">{form_text}</div>
			<Image className="anim-pulse" src={art_src} width={size} height={size} draggable={false} alt={art_alt} />
			<div className={"text-center text-sm lg:text-base min-h-6" + (hidden_ability ? " text-special" : "")}>{ability_text}</div>
			<div className="flex flex-col items-center min-h-[30px] lg:min-h-[40px] justify-center">
				{type_images}
			</div>
		</div>
	);
}

/**
 * A more compact party member component
 */
export function PartyMemberSmall(props: {generation: number, pokemon?: Data.TeamSlot}): ReactElement
{
	const component_style = "w-[96px] h-[96px] max-w-full";

	// Return a placeholder div if no pokemon is provided
	if (!props.pokemon)
		return <div className={component_style + " flex flex-col justify-center align-middle text-secondary"}>Empty</div>

	const size = 96;
	const pokemon = Data.getPokemon(props.generation, props.pokemon.id, props.pokemon.form);

	return (
		<div className={component_style}>
			<Image src={pokemon.sprite} width={size} height={size} alt={pokemon.name} />
		</div>
	);
}

/**
 * A context menu that sits above a pokemon selector after right clicking
 */
export function PokemonSelectorContextMenu(props: {pokemon: Data.Pokemon, closeCallback: Function}): ReactElement
{
	// Add a global listener to run the close callback when a clicking anywhere on the page
	useEffect(() => {
		const handleClick = () => {
			props.closeCallback();
		}

		document.addEventListener("click", handleClick);
		document.addEventListener("contextmenu", handleClick);

		return () => {
			document.removeEventListener("click", handleClick);
			document.removeEventListener("contextmenu", handleClick);
		}
	}, []);

	// Get images for the pokemon's types
	const type_images: ReactElement[] = [];
	for (let i=0; i < props.pokemon.types.length; ++i) {
		const src = Data.typeSpriteURL(props.pokemon.types[i]);
		type_images.push(<Image className="inline-flex" src={src} width={100} height={20} alt={Data.getTypeName(props.pokemon.types[i])} key={i}/>)
	}

	return (
		<Link href={"https://pokemondb.net/pokedex/" + props.pokemon.id} target="_blank" rel="noopener noreferrer">
			<div className="popup anim-grow center-absolute bottom-full whitespace-nowrap">
				<div>{props.pokemon.name}</div>
				<div className="text-sm text-secondary mb-2">{props.pokemon.form}</div>
				<div className="flex flex-col min-w-[100px] justify-center items-center">
					{type_images}
				</div>
			</div>
		</Link>
	)
}

/**
 * A component that is show a selectable pokemon
 * @param props.id The id of the pokemon
 * @param props.form The pokemon's form id
 */
export function PokemonSelector(props: {generation: number, id: number, form?: number, selected?: boolean}): ReactElement
{
	const [contextMenu, setContextMenu] = useState<boolean>(false);
	const dispatch = useContext(DispatchContext);
	const size = 96;

	const pokemon = Data.getPokemon(props.generation, props.id, props.form);
	const hidden = props.selected ? "" : " hide";

	function handleLeftClick(event: MouseEvent<HTMLDivElement>) {
		setContextMenu(false);
		dispatch({
			type: Task.select_pokemon,
			data: { id: props.id, form: props.form }
		});
	}

	function handleRightClick(event: MouseEvent<HTMLDivElement>) {
		event.preventDefault();
		setContextMenu(!contextMenu);
	}

	return (
		<div className="relative">
			<div tabIndex={0} className={"flex items-center justify-center panel clickable p-0 w-full aspect-square" + (props.selected ? " slow-wiggle" : " wiggle")} onClick={(e)=>handleLeftClick(e)} onContextMenu={(e)=>handleRightClick(e)}>
				<Image src={Data.imageURL("poke-ball.png")} width={24} height={24} alt="selected" className={"left-1 top-1 absolute pop" + hidden} />
				<Image src={pokemon.sprite} width={size} height={size} alt={pokemon.name} className="wiggle-target" />
			</div>
			{contextMenu && <PokemonSelectorContextMenu pokemon={pokemon} closeCallback={()=>{setContextMenu(false)}} />}
		</div>
	);
}

/**
 * A button that enables or disables filtering of selectable pokemon by a given type
 * @param props.type The id of the type the button will control
 * @param props.active A flag that determines if the button will be rendered in its active or inactive state
 * @param props.onClick The function called when the filter button is clicked
 */
export function TypeFilterButton(props: {type: number, active: boolean, onClick: BooleanFilterCallback}): ReactElement
{
	const size = 32;
	const filter_style = props.active ? "" : " inactive";

	return (
		<Image
			tabIndex={0}
			src={Data.typeIconURL(props.type)}
			width={size} height={size}
			alt={Data.getTypeName(props.type)}
			onClick={()=>props.onClick(props.type)}
			onContextMenu={(e)=>{
				e.preventDefault();
				props.onClick(props.type, true);
			}}
			className={"rounded-2xl cursor-pointer filter-button" + filter_style}
		/>
	);
}

/**
 * A button that enables or disables filtering of teams by generation
 */
export function GenerationFilterButton(props: {generation: number, active: boolean, onClick: BooleanFilterCallback}): ReactElement
{
	const filter_style = props.active ? "" : " inactive";

	return (
		<button
			className={"min-w-[32px] min-h-[32px] rounded-2xl cursor-pointer bg-panel text-xs font-bold filter-button" + filter_style}
			onClick={()=>props.onClick(props.generation - 1)}
			onContextMenu={(e)=>{
				e.preventDefault();
				props.onClick(props.generation - 1, true);
			}}
		>{Data.getRomanNumeral(props.generation)}</button>
	);
}

/**
 * A button that enables or disables filtering of all pokemon types
 * @param props.active A flag that determines if the button will be rendered in its active or inactive state
 * @param props.onClick The function called when the filter button is clicked
 */
export function AllFilterButton(props: {active: boolean, onClick: BooleanFilterCallback}): ReactElement
{
	const filter_style = props.active ? "" : " inactive";

	return (
		<button
			className={"min-w-[32px] min-h-[32px] rounded-2xl cursor-pointer bg-panel text-xs font-bold filter-button" + filter_style}
			onClick={()=>props.onClick(-1, true)}
			onContextMenu={(e)=>{
				e.preventDefault();
				props.onClick(-1, false);
			}}
		>ALL</button>
	);
}

/**
 * A text input that controls filtering selecable pokemon based on the input text
 */
export function NameFilterBox(props: {text: string, onChange: NameFilterCallback}): ReactElement
{
	const ref = useRef<HTMLInputElement>(null);

	// Remove focus when the form is submitted
	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		ref.current?.blur();
	}

	return (
		<form onSubmit={(e) => handleSubmit(e)}>
			<input
				type="text" value={props.text} ref={ref}
				placeholder="Type a name to filter"
				onChange={(event)=>props.onChange(event.target.value)}
				className="inner-panel px-2 max-h-8 w-48"
			/>
		</form>
	)
}

/**
 * A component that shows a defensive advantage or disadvantage for the user's team
 */
const icon_size = 16;
export function CoverageIcon(props: {type: CoverageStyle, source?: Data.TeamSlot}): ReactElement
{
	// Apply different icons and colors based on the information we need to display
	let icon = "";
	let style = "";
	if (props.type === CoverageStyle.advantage) {
		icon += "solar--round-alt-arrow-up-bold";
		style += " text-advantage";
	} else if (props.type === CoverageStyle.weakness) {
		icon += "solar--round-alt-arrow-down-bold";
		style += " text-disadvantage";
	} else {
		icon += "solar--record-bold";
		style += " text-foreground";
	}

	return (
		<div className={style}>
			<svg width={icon_size} height={icon_size} className={"w-[12px] lg:w-[16px] h-[12px] lg:h-[16px] rounded-xl"}><use href={Data.iconURL(icon)} /></svg>
		</div>
	);
}

/**
 * A component that displays the type advantages and disadvantages the user's team has against a particular type
 */
export function Coverage(props: {type: number, offense: TypeCoverage, defense: TypeCoverage}): ReactElement
{
	// Create icons to show the team's strengths and weaknesses
	const top_components: ReactElement[] = [];
	const bottom_components: ReactElement[] = [];
	for (let i=0; i<Data.party_size; ++i) {
		if (i < props.offense.advantage.length) {
			top_components.push(<CoverageIcon type={CoverageStyle.advantage} source={props.offense.advantage[i]} key={i} />);
		} else if (i < props.offense.advantage.length + props.offense.disadvantage.length) {
			top_components.push(<CoverageIcon type={CoverageStyle.weakness} source={props.offense.disadvantage[i-props.offense.advantage.length]} key={i} />);
		} else {
			top_components.push(<CoverageIcon type={CoverageStyle.neutral} key={i} />);
		}

		if (i < props.defense.advantage.length) {
			bottom_components.push(<CoverageIcon type={CoverageStyle.advantage} source={props.defense.advantage[i]} key={i} />);
		} else if (i < props.defense.advantage.length + props.defense.disadvantage.length) {
			bottom_components.push(<CoverageIcon type={CoverageStyle.weakness} source={props.defense.disadvantage[i-props.defense.advantage.length]} key={i} />);
		} else {
			bottom_components.push(<CoverageIcon type={CoverageStyle.neutral} key={i} />);
		}
	}

	const offense_highlight = props.offense.highlight > 0 ? " glow-pos" : (props.offense.highlight < 0 ? " glow-neg" : "");
	const defense_highlight = props.defense.highlight > 0 ? " glow-pos" : (props.defense.highlight < 0 ? " glow-neg" : "");

	return (
		<div className="flex flex-col items-center gap-0.5 basis-[10%]">
			<Image className="w-[75px] lg:w-[100px]" src={Data.typeSpriteURL(props.type)} width={100} height={20} alt={Data.getTypeName(props.type)} />
			<div className={"flex flex-row rounded-2xl" + offense_highlight}>{top_components}</div>
			<div className={"flex flex-row rounded-2xl" + defense_highlight}>{bottom_components}</div>
		</div>
	);
}


/**
 * A component used to select a set of pokemon from a given game
 */
export function GameSelector(props: {game: Data.Game, logoCycle: number}): ReactElement
{
	const dispatch = useContext(DispatchContext);
	const openModal = useContext(ModalContext);
	const unsafe = useContext(UnsafeDataContext);

	// Dispatch a action to switch to the corresponding game when the selector is clicked
	function handleClick() {
		if (unsafe) {
			openModal({
				child: <div>Your current party is not saved.<br /><br />Do you wish to switch to the selected game?<br />Unsaved changes to the current team will be lost.</div>,
				buttons: [{
						label: "Confirm",
						callback: () => dispatch({
								type: Task.planner_view,
								data: props.game.id
							})
					},
					{ label: "Cancel" }
				]
			});
		} else {
			dispatch({
				type: Task.planner_view,
				data: props.game.id
			});
		}
	}

	// Create image tags for each game version
	const images: ReactElement[] = [];
	for (let i = 0; i < props.game.versions.length; ++i)
	{
		const image_style = (i === (props.logoCycle % props.game.versions.length) ? "" : " hide");
		images.push(
			<img
				src={Data.logoURL(props.game.versions[i].logo)}
				alt={props.game.versions[i].name}
				className={"absolute w-[100px] lg:w-[150px] fade" + image_style}
				key={i}
			/>);
	}
	
	return (
		<div tabIndex={0} className="flex flex-row flex-wrap justify-center items-center panel clickable p-2 gap-2 text-center w-[130px] lg:w-[230px] h-[130px] lg:h-[170px]" onClick={()=>handleClick()}>
			{images}
		</div>
	);
}

/**
 * Display the name of the team in an editable textbox
 */
export function TeamName(props: {name: string}): ReactElement
{
	const ref = useRef<HTMLInputElement>(null);
	const dispatch = useContext(DispatchContext);

	// Remove focus when the form is submitted
	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		ref.current?.blur();
	}

	return (
		<div className="panel text-lg text-center min-w-1/4 self-center">
			<form onSubmit={(e) => handleSubmit(e)}>
				<input type="text" name="textbox" value={props.name} className="text-center rounded-lg" ref={ref}
					onChange={(e)=>{
						dispatch({
							type: Task.change_name,
							data: e.currentTarget.value
						})
					}}
				/>
			</form>
		</div>
	);
}

/**
 * A floating menu icon that sticks to the corner of the screen
 */
export function MenuButton(props: {openCallback: Function}): ReactElement
{
	return (
		<div tabIndex={0} className="panel clickable p-1 fixed left-2 top-2 z-1" onClick={()=>props.openCallback()}>
			<svg className="w-[20px] h-[20px] lg:w-[32px] lg:h-[32px]"><use href={Data.iconURL("solar--hamburger-menu-linear")} /></svg>
		</div>
	);
}

/**
 * A button for the main side menu
 */
export function SidebarButton(props: {label: string, icon: string, disabled?: boolean, onClick: Function}): ReactElement
{
	const style = props.disabled ? " text-disabled" : " clickable";
	return (
		<button className={"panel flex flex-row items-center" + style} onClick={()=>{ if (!props.disabled) props.onClick() }}>
			<svg width={32} height={32}><use href={Data.iconURL(props.icon)} /></svg>
			<div className="mx-4 flex-grow">{props.label}</div>
		</button>
	);
}

/**
 * A button that handles the file loading dialog for importing teams
 */
export function SidebarImportButton(): ReactElement
{
	const dispatch = useContext(DispatchContext);
	const openModal = useContext(ModalContext);

	// Load data from the file the user provides when a file is selected
	async function handleFile(event: FormEvent<HTMLInputElement>) {
		if (event.currentTarget.files && event.currentTarget.files.item(0)) {
			// Parse the provided file for team data
			// @ts-ignore
			const teams = await Data.loadTeamsFromJSON(event.currentTarget.files.item(0));
			if (teams) {
				// Load the teams in the file
				openModal({
					child: <div>Loading saved team data will overwrite all currently saved teams.<br /><br />Do you wish to load team data from this file?</div>,
					buttons: [{
							label: "Yes", callback: () => {
								dispatch({
									type: Task.import_teams,
									data: teams
								});
						}},
						{ label: "Cancel" }
					]
				});
			} else {
				openModal({
					child: <div>Unable to load team data from the provided file.<br />Please ensure that the corrent file was loaded.</div>,
					buttons: [
						{ label: "Okay" }
					]
				});
			}
		}
	}

	return (
		<div className={"panel clickable flex flex-row items-center flex-grow"}>
			<input type="file" className="absolute top-0 left-0 rounded-lg w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFile(e)} />
			<svg width={32} height={32}><use href={Data.iconURL("solar--cloud-upload-bold")} /></svg>
			<div className="mx-4 flex-grow text-center">Import Teams</div>
		</div>
	);
}

/**
 * A dropdown with a list of selectable versions
 */
export function VersionSelector(props: {game: Data.Game, version: number, onSelect: Function}): ReactElement
{
	// Create a set of options for the selector box
	const options: ReactElement[] = [];
	for (let i = 0; i < props.game.versions.length; ++i) {
		options.push(<li tabIndex={0} className="clickable" key={i+1} onClick={()=>props.onSelect(i)}>{props.game.versions[i].name}</li>);
	}

	options.unshift(<li tabIndex={0} className="clickable" key={0} onClick={()=>props.onSelect(-1)}>All</li>);

	return (
		<ul className="popup top-full left-0 mt-[2px] min-w-full anim-grow">{options}</ul>
	);
}

/**
 * A dropdown with a list of sorting options
 */
export function SortSelector(props: {onSelect: PartySortCallback}): ReactElement
{
	// Create a set of options for the selector box
	const options: ReactElement[] = [];
	for (let i = 0; i < sort_options.length; ++i) {
		options.push(<li tabIndex={0} className="clickable" key={i+1} onClick={()=>props.onSelect(sort_options[i])}>{sort_options[i].label}</li>);
	}

	return (
		<ul className="popup top-full left-0 mt-[2px] min-w-full anim-grow">{options}</ul>
	);
}

/**
 * A tutorial button that opens a modal explaining a feature
 */
const tutorial_button_size = 16;
export function TutorialButton(props: {message: ReactElement}): ReactElement
{
	const openModal = useContext(ModalContext);

	return (
		<button className="cursor-pointer rounded-2xl absolute top-0 right-[-24px]" onClick={() => {
			openModal({
				child: <div>{props.message}</div>,
				buttons: [{ label: "Close" }]
			});
		}}>
			<svg width={tutorial_button_size} height={tutorial_button_size}><use href={Data.iconURL("solar--question-circle-bold")} /></svg>
		</button>
	);
}

/**
 * A sticky button that scrolls back to the top of the page
 */
export function ScrollButton(): ReactElement
{
	const [hidden, setHidden] = useState(true);

	// Hide the button when the window scrolls below the top
	function onScroll() {
		if (window.scrollY > 12) {
			setHidden(false);
		} else {
			setHidden(true);
		}
	}

	// Attach the scroll listener when the component renders
	useEffect(() => {
		window.addEventListener("scroll", onScroll);
		return () => {window.removeEventListener("scroll", onScroll)}
	}, []);

	return (
		<button className={"panel fixed right-2 bottom-2 pop-fast" + (hidden ? " hide" : " clickable")} onClick={() => {if (!hidden) window.scroll({top: 0, behavior: "smooth"})}}>
			<svg className="w-[12px] h-[12px] lg:w-[24px] lg:h-[24px]"><use href={Data.iconURL("solar--arrow-up-linear")} /></svg>
		</button>
	);
}

/**
 * The component displayed when the app is loading
 */
export function LoadingScreen(): ReactElement
{
	return (
		<div className="panel">
			Loading...
		</div>
	);
}

/**
 * A Button that switches the sorting order for filtered components
 */
export function SortOrderButton(props: {sortAscending: boolean, onClick: Function}): ReactElement
{
	// Set the button's style to flip it vertically depending on the selected sorting order
	let image_style = "w-[24px] h-[24px] scale-transition";
	if (props.sortAscending)
		image_style += " flip";

	return (
		<button className="panel clickable w-[32px] h-[32px] rounded-2xl p-0 flex justify-center items-center" onClick={() => {props.onClick()}}>
			<svg className={image_style}><use href={Data.iconURL("solar--arrow-up-linear")} /></svg>
		</button>
	);
}