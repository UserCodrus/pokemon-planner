'use client';

import { MouseEvent, MouseEventHandler, ReactElement, useContext, useState } from "react";
import Image from 'next/image'

import * as Data from "./data";
import Link from "next/link";
import { DispatchContext, Task } from "./reducer";

export type SelectionCallback = (id: number, form?: number) => void;
export type AbilityCallback = (selectedPokemon: Data.TeamSlot) => void;
export type GameCallback = (game: Data.Game) => void;
export type TypeFilterCallback = (type: number) => void;
export type NameFilterCallback = (text: string) => void;

const enum CoverageStyle {
	neutral,
	coverage,
	advantage,
	weakness
}

/**
 * A component that displays a pokemon the user has selected for their party
 * @param props.id The national dex id of the pokemon that the panel will display
 * @param props.form The id of the form that the pokemon will use
 */
export function PartyMember(props: {generation: number, pokemon: Data.TeamSlot}): ReactElement
{
	const dispatch = useContext(DispatchContext);
	const size = 200;

	const pokemon = Data.getPokemon(props.generation, props.pokemon.id, props.pokemon.form);

	const ability_set = Data.getPokemonAbilities(props.generation, props.pokemon.id, props.pokemon.form);
	const ability = Data.getAbility(ability_set[props.pokemon.ability]);

	// Create images for the type displays and artwork, with fallbacks for empty party slots
	const type_images: ReactElement[] = [];
	let art_alt = "Empty";
	let art_src = Data.default_image;
	if (props.pokemon.id > 0)
	{
		for (let i=0; i < pokemon.types.length; ++i)
		{
			const src = Data.typeSpriteURL(pokemon.types[i]);
			type_images.push(<Image className="inline-flex" src={src} width={100} height={20} alt={Data.getTypeName(pokemon.types[i])} key={i}/>)
		}

		art_src = pokemon.art;
		art_alt = pokemon.name;
	}

	// Set the text for the ability line
	let ability_text = "";
	if (props.generation > 2)
	{
		ability_text = ability.name;
		if (props.pokemon.ability === 2)
			ability_text += " [Hidden]";
	}

	// Handle mouse clicks
	function handleLeftClick(event: MouseEvent<HTMLDivElement>)
	{
		dispatch({
			type: Task.swap_ability,
			data: props.pokemon
		});
	}
	function handleRightClick(event: MouseEvent<HTMLDivElement>)
	{
		event.preventDefault();
		dispatch({
			type: Task.select_pokemon,
			data: props.pokemon
		});
	}

	return (
		<div className="panel clickable p-4 flex flex-col items-center anim-pulse" onClick={(e)=>handleLeftClick(e)} onContextMenu={(e)=>handleRightClick(e)}>
			<div className="text-center min-h-6">{props.pokemon.id > 0 ? pokemon.name : ""}</div>
			<Image src={art_src} width={size} height={size} alt={art_alt} />
			<div>{ability_text}</div>
			<div className="flex flex-col min-h-[40px] min-w-[100px] justify-center">
				{type_images}
			</div>
		</div>
	);
}

/**
 * A context menu that sits above a pokemon selector after right clicking
 */
export function PokemonSelectorPopup(props: {pokemon: number}): ReactElement
{
	return (
		<Link href={"https://pokemondb.net/pokedex/" + props.pokemon} target="_blank" rel="noopener noreferrer">
			<div className="popup">
				View on Pokémon Database
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
		<div className="relative" onMouseLeave={(e)=>setContextMenu(false)}>
			<div className="panel clickable p-1 min-w-[96px] min-h-[96px] relative" onClick={(e)=>handleLeftClick(e)} onContextMenu={(e)=>handleRightClick(e)}>
				<Image src={Data.imageURL("poke-ball.png")} width={24} height={24} alt="selected" className={"left-1 top-1 absolute fade" + hidden} />
				<Image src={pokemon.sprite} width={size} height={size} alt={pokemon.name} />
			</div>
			{contextMenu && <PokemonSelectorPopup pokemon={props.id} />}
		</div>
	);
}

/**
 * A button that enables or disables filtering of selectable pokemon by a given type
 * @param props.type The id of the type the button will control
 * @param props.onClick The function called when the filter button is clicked
 */
export function TypeFilterButton(props: {type: number, active: boolean, onClick: TypeFilterCallback}): ReactElement
{
	const size = 32;
	const filter_style = props.active ? "" : " inactive";

	return (
		<Image
			src={Data.typeIconURL(props.type)}
			width={size} height={size}
			alt={Data.getTypeName(props.type)}
			onClick={()=>props.onClick(props.type)}
			className={"cursor-pointer" + filter_style}
		/>
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
			className="bg-white text-black px-2"
		/>
	)
}

/**
 * A component that shows a defensive advantage or disadvantage for the user's team
 */
const icon_source = "/icons.svg"
const icon_size = 16;
export function CoverageIcon(props: {type: CoverageStyle, source?: Data.TeamSlot}): ReactElement
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
	else if (props.type === CoverageStyle.coverage)
	{
		src += "#solar--round-alt-arrow-up-bold";
		style += " text-advantage";
	}
	else
	{
		src += "#solar--record-bold";
		style += " text-foreground";
	}

	return (
		<div className={style}>
			<svg width={icon_size} height={icon_size}><use href={src} /></svg>
		</div>
	);
}

/**
 * A component that displays the type advantages and disadvantages the user's team has against a particular type
 */
export function Coverage(props: {type: number, coverage: Data.TeamSlot[], advantages: Data.TeamSlot[], weaknesses: Data.TeamSlot[]}): ReactElement
{
	// Create icons to show the team's strengths and weaknesses
	const top_components: ReactElement[] = [];
	const bottom_components: ReactElement[] = [];
	for (let i=0; i<Data.party_size; ++i)
	{
		if (i < props.coverage.length)
		{
			top_components.push(<CoverageIcon type={CoverageStyle.coverage} source={props.coverage[i]} key={i} />);
		}
		else
		{
			top_components.push(<CoverageIcon type={CoverageStyle.neutral} key={i} />);
		}

		if (i < props.advantages.length)
		{
			bottom_components.push(<CoverageIcon type={CoverageStyle.advantage} source={props.advantages[i]} key={i} />);
		}
		else if (i < props.advantages.length + props.weaknesses.length)
		{
			bottom_components.push(<CoverageIcon type={CoverageStyle.weakness} source={props.weaknesses[i-props.advantages.length]} key={i} />);
		}
		else
		{
			bottom_components.push(<CoverageIcon type={CoverageStyle.neutral} key={i} />);
		}
	}

	return (
		<div className="flex flex-col items-center gap-0.5 basis-[10%]">
			<Image src={Data.typeSpriteURL(props.type)} width={100} height={20} alt={Data.getTypeName(props.type)} />
			<div className="flex flex-row">{top_components}</div>
			<div className="flex flex-row">{bottom_components}</div>
		</div>
	);
}

/**
 * A component used to select a set of pokemon from a given game
 */
export function PokedexSelector(props: {game: Data.Game}): ReactElement
{
	const dispatch = useContext(DispatchContext);
	
	return (
		<Link href={"?game=" + props.game.id}>
			<div className="panel p-1 px-2 select-none cursor-pointer text-center">
				<div>Generation {props.game.generation}</div>
				<div>{props.game.games}</div>
			</div>
		</Link>
	);
}