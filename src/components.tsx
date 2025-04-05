'use client';

import { ReactElement } from "react";
import Image from 'next/image'

import * as Data from "./data";

export type SelectionCallback = (id: number, form?: string) => void;
export type TypeFilterCallback = (type: number) => void;
export type NameFilterCallback = (text: string) => void;

export type SelectedPokemon = {
	id: number,
	form?: string
};

export type TypeAdvantage = {
	pokemon: SelectedPokemon,
	advantage: boolean
}

export type TypeComparison = {
	advantages: TypeAdvantage[],
	disadvantages: TypeAdvantage[],
}

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
export function PartyMember(props: {generation: number, pokemon: SelectedPokemon, onClick: SelectionCallback}): ReactElement
{
	const size = 200;

	const pokemon = Data.getPokemon(props.generation, props.pokemon.id, props.pokemon.form);

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

	const art = <Image src={art_src} width={size} height={size} alt={art_alt} />;

	return (
		<div className="panel clickable p-4 flex flex-col items-center anim-pulse" onClick={() => {props.onClick(props.pokemon.id, props.pokemon.form)}}>
			<div className="text-center min-h-6">{props.pokemon.id > 0 ? pokemon.name : ""}</div>
			{art}
			<div className="flex flex-col min-h-[40px] min-w-[100px] justify-center">
				{type_images}
			</div>
		</div>
	);
}

/**
 * A component that is show a selectable pokemon
 * @param props.id The id of the pokemon
 * @param props.form The pokemon's form id
 */
export function PokemonSelector(props: {generation: number, id: number, form?: string, selected?: boolean, onClick: SelectionCallback}): ReactElement
{
	const size = 96;

	const pokemon = Data.getPokemon(props.generation, props.id, props.form);
	const hidden = props.selected ? "" : " hide";

	return (
		<div className="panel clickable p-1 min-w-[96px] min-h-[96px] relative" onClick={() => {props.onClick(props.id, props.form)}}>
			<Image src={Data.imageURL("poke-ball.png")} width={24} height={24} alt="selected" className={"left-1 top-1 absolute fade" + hidden} />
			<Image src={pokemon.sprite} width={size} height={size} alt={pokemon.name} />
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
export function CoverageIcon(props: {type: CoverageStyle, source?: SelectedPokemon}): ReactElement
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
export function Coverage(props: {type: number, coverage: SelectedPokemon[], advantages: SelectedPokemon[], weaknesses: SelectedPokemon[]}): ReactElement
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

export function TESTGenSelector(props: {gen: number, callback: Function}): ReactElement
{
	return (
		<div className="panel p-1" onClick={()=>props.callback(props.gen)}>Gen {props.gen}</div>
	);
}