'use client';

import { ReactElement } from "react";
import Image from 'next/image'

import * as Data from "./data";
import Pokedex from "../data/pokedex.json";
import Pokemon from "../data/pokemon.json";

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

/**
 * A component that displays a pokemon the user has selected for their party
 * @param props.id The national dex id of the pokemon that the panel will display
 * @param props.form The id of the form that the pokemon will use
 */
export function PartyMember(props: {pokemon: SelectedPokemon, onClick: SelectionCallback}): ReactElement
{
	const size = 200;

	const pokemon = Pokemon[props.pokemon.id];

	// Search for a form that matches the provided form id
	let form = pokemon.forms[0];
	if (props.pokemon.form)
	{
		for (const pokemon_form of pokemon.forms)
		{
			if (pokemon_form.name === props.pokemon.form)
			{
				form = pokemon_form;
				break;
			}
		}
	}

	// Create images for the type displays and artwork, with fallbacks for empty party slots
	const type_images: ReactElement[] = [];
	let art_alt = "Empty";
	let art_src = Data.default_image;
	if (props.pokemon.id > 0)
	{
		for (let i=0; i < form.types.length; ++i)
		{
			const src = Data.typeSpriteURL(form.types[i]);
			type_images.push(<Image className="inline-flex" src={src} width={100} height={20} alt={Data.getTypeName(form.types[i])} key={i}/>)
		}

		art_src = Data.pokemonArtURL(form.art);
		art_alt = form.name;
	}

	const art = <Image src={art_src} width={size} height={size} alt={art_alt} />;

	return (
		<div className="panel clickable p-4 flex flex-col items-center anim-pulse" onClick={() => {props.onClick(props.pokemon.id, props.pokemon.form)}}>
			<div className="text-center min-h-6">{props.pokemon.id > 0 ? form.name : ""}</div>
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
export function PokemonSelector(props: {id: number, form?: string, selected?: boolean, onClick: SelectionCallback}): ReactElement
{
	const size = 96;

	const pokemon = Pokemon[props.id];

	// Search for a form that matches the provided form id
	let form = pokemon.forms[0];
	if (props.form)
	{
		for (const pokemon_form of pokemon.forms)
		{
			if (pokemon_form.name === props.form)
			{
				form = pokemon_form;
				break;
			}
		}
	}

	const hidden = props.selected ? "" : " hide";

	return (
		<div className="panel clickable p-1 min-w-[96px] min-h-[96px] relative" onClick={() => {props.onClick(props.id, props.form)}}>
			<Image src={Data.imageURL("poke-ball.png")} width={24} height={24} alt="selected" className={"left-1 top-1 absolute fade" + hidden} />
			<Image src={Data.pokemonSpriteURL(form.sprite)} width={size} height={size} alt={form.name} />
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
 * A component that displays the type advantages and disadvantages of the user's team
 */
export function Coverage(props: {type: number, coverage: SelectedPokemon[], advantages: SelectedPokemon[], weaknesses: SelectedPokemon[]}): ReactElement
{
	let defense = "";
	for (const advantage of props.advantages)
	{
		defense += "+";
	}
	for (const weakness of props.weaknesses)
	{
		defense += "-";
	}

	let attack = "";
	for (const coverage of props.coverage)
	{
		attack += "0";
	}

	return (
		<div>
			<Image src={Data.typeSpriteURL(props.type)} width={100} height={20} alt={Data.getTypeName(props.type)} />
			<div>{attack}</div>
			<div>{defense}</div>
		</div>
	);
}