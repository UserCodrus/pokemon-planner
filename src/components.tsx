'use client';

import { MouseEvent, ReactElement, useContext, useState, useEffect } from "react";
import Image from 'next/image'

import * as Data from "./data";
import Link from "next/link";
import { DispatchContext, Task } from "./reducer";
import { ModalContext } from "./modal";

export type SelectionCallback = (id: number, form?: number) => void;
export type AbilityCallback = (selectedPokemon: Data.TeamSlot) => void;
export type GameCallback = (game: Data.Game) => void;
export type TypeFilterCallback = (type: number, single?: boolean) => void;
export type NameFilterCallback = (text: string) => void;
export type VersionFilterCallback = (version: number) => void;

/**
 * Specify which party members in a team are strong or weak against a type
 */
export type TypeCoverage = {
	advantage: Data.TeamSlot[],
	disadvantage: Data.TeamSlot[],
	highlight: number
}

const icon_source = "/icons.svg";

const enum CoverageStyle {
	neutral,
	advantage,
	weakness
}

/**
 * A component that displays a pokemon the user has selected for their party
 * @param props.id The national dex id of the pokemon that the panel will display
 * @param props.form The id of the form that the pokemon will use
 */
export function PartyMember(props: {game: Data.Game, pokemon?: Data.TeamSlot, ability?: number}): ReactElement
{
	const dispatch = useContext(DispatchContext);
	const size = 200;

	// Create images for the type displays and artwork, with fallbacks for empty party slots
	let name_text = "";
	let form_text = "";
	let ability_text = "";

	let art_alt = "Empty";
	let art_src = Data.default_image;
	const type_images: ReactElement[] = [];

	if (props.pokemon)
	{
		// Retrieve pokemon data
		const pokemon = Data.getPokemon(props.game.generation, props.pokemon.id, props.pokemon.form);
		name_text = pokemon.name;
		form_text = pokemon.form;

		for (let i=0; i < pokemon.types.length; ++i)
		{
			const src = Data.typeSpriteURL(pokemon.types[i]);
			type_images.push(<Image className="inline-flex" src={src} width={100} height={20} alt={Data.getTypeName(pokemon.types[i])} key={i}/>)
		}

		art_src = pokemon.art;
		art_alt = pokemon.name;

		// Set the text for the ability line
		if (props.ability !== undefined && props.game.abilities)
		{
			const ability_set = Data.getPokemonAbilities(props.game.generation, props.pokemon.id, props.pokemon.form);
			const ability = Data.getAbility(ability_set[props.ability]);
	
			ability_text = ability.name;
			if (props.ability === 2)
				ability_text += " [Hidden]";
		}
	}

	// Handle mouse clicks
	function handleLeftClick(event: MouseEvent<HTMLDivElement>)
	{
		if (props.pokemon)
			dispatch({
				type: Task.swap_ability,
				data: props.pokemon
			});
	}
	function handleRightClick(event: MouseEvent<HTMLDivElement>)
	{
		event.preventDefault();
		if (props.pokemon)
			dispatch({
				type: Task.select_pokemon,
				data: props.pokemon
			});
	}

	return (
		<div tabIndex={0} className="panel clickable p-4 max-w-[30%] flex flex-col items-center anim-pulse" onClick={(e)=>handleLeftClick(e)} onContextMenu={(e)=>handleRightClick(e)}>
			<div className="text-center min-h-6">{name_text}</div>
			<div className="text-center text-secondary text-sm min-h-5">{form_text}</div>
			<Image src={art_src} width={size} height={size} alt={art_alt} />
			<div className="text-center min-h-6">{ability_text}</div>
			<div className="flex flex-col min-h-[40px] min-w-[100px] justify-center">
				{type_images}
			</div>
		</div>
	);
}

/**
 * A more compact party member component
 */
export function PartyMemberSmall(props: {generation: number, pokemon: Data.TeamSlot}): ReactElement
{
	const size = 96;
	const pokemon = Data.getPokemon(props.generation, props.pokemon.id, props.pokemon.form);

	return (
		<div className="p-1 min-w-[96px] min-h-[96px]">
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
	for (let i=0; i < props.pokemon.types.length; ++i)
	{
		const src = Data.typeSpriteURL(props.pokemon.types[i]);
		type_images.push(<Image className="inline-flex" src={src} width={100} height={20} alt={Data.getTypeName(props.pokemon.types[i])} key={i}/>)
	}

	return (
		<Link href={"https://pokemondb.net/pokedex/" + props.pokemon.id} target="_blank" rel="noopener noreferrer">
			<div className="popup anim-grow center-absolute bottom-full whitespace-nowrap">
				<div>{props.pokemon.name}</div>
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

	function handleLeftClick(event: MouseEvent<HTMLDivElement>)
	{
		setContextMenu(false);
		dispatch({
			type: Task.select_pokemon,
			data: { id: props.id, form: props.form }
		});
	}
	function handleRightClick(event: MouseEvent<HTMLDivElement>)
	{
		event.preventDefault();
		setContextMenu(!contextMenu);
	}

	return (
		<div className="relative" /*onMouseLeave={(e)=>setContextMenu(false)}*/>
			<div tabIndex={0} className="panel clickable p-1 min-w-[96px] min-h-[96px]" onClick={(e)=>handleLeftClick(e)} onContextMenu={(e)=>handleRightClick(e)}>
				<Image src={Data.imageURL("poke-ball.png")} width={24} height={24} alt="selected" className={"left-1 top-1 absolute fade" + hidden} />
				<Image src={pokemon.sprite} width={size} height={size} alt={pokemon.name} />
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
export function TypeFilterButton(props: {type: number, active: boolean, onClick: TypeFilterCallback}): ReactElement
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
			className={"rounded-2xl cursor-pointer" + filter_style}
		/>
	);
}

/**
 * A button that enables or disables filtering of all pokemon types
 * @param props.active A flag that determines if the button will be rendered in its active or inactive state
 * @param props.onClick The function called when the filter button is clicked
 */
export function AllFilterButton(props: {active: boolean, onClick: TypeFilterCallback}): ReactElement
{
	const filter_style = props.active ? "" : " inactive";

	return (
		<button
			className={"min-w-[32px] min-h-[32px] rounded-2xl cursor-pointer" + filter_style}
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
	return (
		<input
			type="text" value={props.text}
			placeholder="Type a name to filter"
			onChange={(event)=>props.onChange(event.target.value)}
			className="inner-panel px-2 max-h-8"
		/>
	)
}

/**
 * A component that shows a defensive advantage or disadvantage for the user's team
 */
const icon_size = 16;
export function CoverageIcon(props: {type: CoverageStyle, highlight: number, source?: Data.TeamSlot}): ReactElement
{
	// Apply different icons and colors based on the information we need to display
	let src = icon_source;
	let style = "";
	if (props.type === CoverageStyle.advantage)
	{
		src += "#solar--round-alt-arrow-up-bold";
		style += " text-advantage";
	}
	else if (props.type === CoverageStyle.weakness)
	{
		src += "#solar--round-alt-arrow-down-bold";
		style += " text-disadvantage";
	}
	/*else if (props.type === CoverageStyle.coverage)
	{
		src += "#solar--round-alt-arrow-up-bold";
		style += " text-advantage";
	}*/
	else
	{
		src += "#solar--record-bold";
		style += " text-foreground";
	}

	// Add a glow effect if needed
	const highlight_style = props.highlight > 0 ? "rounded-xl glow-pos" : (props.highlight < 0 ? "rounded-xl glow-neg" : "");

	return (
		<div className={style}>
			<svg width={icon_size} height={icon_size} className={highlight_style}><use href={src} /></svg>
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
	for (let i=0; i<Data.party_size; ++i)
	{
		if (i < props.offense.advantage.length)
		{
			top_components.push(<CoverageIcon highlight={props.offense.highlight} type={CoverageStyle.advantage} source={props.offense.advantage[i]} key={i} />);
		}
		else if (i < props.offense.advantage.length + props.offense.disadvantage.length)
		{
			top_components.push(<CoverageIcon highlight={props.offense.highlight} type={CoverageStyle.weakness} source={props.offense.disadvantage[i-props.offense.advantage.length]} key={i} />);
		}
		else
		{
			top_components.push(<CoverageIcon highlight={props.offense.highlight} type={CoverageStyle.neutral} key={i} />);
		}

		if (i < props.defense.advantage.length)
		{
			bottom_components.push(<CoverageIcon highlight={props.defense.highlight} type={CoverageStyle.advantage} source={props.defense.advantage[i]} key={i} />);
		}
		else if (i < props.defense.advantage.length + props.defense.disadvantage.length)
		{
			bottom_components.push(<CoverageIcon highlight={props.defense.highlight} type={CoverageStyle.weakness} source={props.defense.disadvantage[i-props.defense.advantage.length]} key={i} />);
		}
		else
		{
			bottom_components.push(<CoverageIcon highlight={props.defense.highlight} type={CoverageStyle.neutral} key={i} />);
		}
	}

	return (
		<div className="flex flex-col items-center gap-0.5 basis-[10%]">
			<Image src={Data.typeSpriteURL(props.type)} width={100} height={20} alt={Data.getTypeName(props.type)} />
			<div className={"flex flex-row"}>{top_components}</div>
			<div className={"flex flex-row"}>{bottom_components}</div>
		</div>
	);
}

/**
 * A component used to select a set of pokemon from a given game
 */
export function PokedexSelector(props: {game: Data.Game}): ReactElement
{
	const dispatch = useContext(DispatchContext);

	function handleClick() {
		dispatch({
			type: Task.change_game,
			data: props.game.id
		});
	}
	
	return (
		<div tabIndex={0} className="panel p-1 px-2 select-none cursor-pointer text-center" onClick={()=>handleClick()}>
			<div>Generation {props.game.generation}</div>
			<div>{props.game.name}</div>
		</div>
	);
}

/**
 * Display the name of the team in an editable textbox
 */
export function TeamName(props: {name: string}): ReactElement
{
	const dispatch = useContext(DispatchContext);

	return (
		<div className="panel text-lg text-center min-w-1/4 self-center">
			<input type="text" name="textbox" value={props.name} className="text-center rounded-lg"
				onChange={(e)=>{
					dispatch({
						type: Task.change_name,
						data: e.currentTarget.value
					})
				}}
			/>
		</div>
	);
}

/**
 * A floating menu icon that sticks to the corner of the screen
 */
export function MenuButton(props: {openCallback: Function}): ReactElement
{
	return (
		<div tabIndex={0} className="fixed left-2 top-2 z-1 text-black cursor-pointer" onClick={()=>props.openCallback()}>
			<svg width={40} height={40}><use href={icon_source + "#solar--hamburger-menu-linear"} /></svg>
		</div>
	);
}

/**
 * A button for the main side menu
 */
export function SidebarButton(props: {label: string, icon: string, onClick:Function}): ReactElement
{
	return (
		<button className="panel clickable flex flex-row items-center" onClick={()=>props.onClick()}>
			<svg width={32} height={32}><use href={icon_source + "#" + props.icon} /></svg>
			<div className="mx-4 flex-grow">{props.label}</div>
		</button>
	);
}

/**
 * A dropdown with a list of selectable vewrsions
 */
export function VersionSelector(props: {game: Data.Game, version: number, onSelect: Function}): ReactElement
{
	// Create a set of options for the selector box
	const options: ReactElement[] = [];
	for (let i = 0; i < props.game.versions.length; ++i)
	{
		options.push(<li tabIndex={0} className="clickable" key={i+1} onClick={()=>props.onSelect(i)}>{props.game.versions[i].name}</li>);
	}

	options.unshift(<li tabIndex={0} className="clickable" key={0} onClick={()=>props.onSelect(-1)}>All</li>);

	return (
			<ul className="popup top-full left-0 mt-[2px] min-w-full anim-grow">{options}</ul>
		);
}

/**
 * A tutorial button that opens a modal explaining a feature
 */
const tutorial_button_size = 16;
export function TutorialButton(props: {message: string}): ReactElement
{
	const openModal = useContext(ModalContext);

	return (
		<button className="cursor-pointer rounded-2xl" onClick={() => {
			openModal({
				message: props.message,
				buttons: [{ label: "Close" }]
			});
		}}>
			<svg width={tutorial_button_size} height={tutorial_button_size}><use href={icon_source + "#solar--question-circle-bold"} /></svg>
		</button>
	);
}

/**
 * A sticky button that scrolls back to the top of the page
 */
export function ScrollButton(): ReactElement
{
	return (
		<button className="panel clickable fixed right-2 bottom-2" onClick={() => {window.scroll({top: 0, behavior: "smooth"})}}>
			<svg width={24} height={24}><use href={icon_source + "#solar--arrow-up-linear"} /></svg>
		</button>
	)
}