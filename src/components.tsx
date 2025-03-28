'use client';

import { ReactElement } from "react";
import Image from 'next/image'

import * as Data from "./data";
import Pokedex from "../data/pokedex.json";
import Pokemon from "../data/pokemon.json";

export type SelectionCallback = (id: number, form?: string) => void;

/**
 * A component that displays a pokemon the user has selected for their party
 * @param props.id The national dex id of the pokemon that the panel will display
 * @param props.form The id of the form that the pokemon will use
 */
export function PartyMember(props: {id: number, form?: string, onClick: SelectionCallback}): ReactElement
{
	const size = 200;

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

	// Create images for the type displays and artwork, with fallbacks for empty party slots
	const type_images: ReactElement[] = [];
	let art_alt = "Empty";
	let art_src = Data.default_image;
	if (props.id > 0)
	{
		for (let i=0; i < form.types.length; ++i)
		{
			const src = Data.typeSpriteURL(form.types[i]);
			type_images.push(<Image className="inline-flex" src={src} width={100} height={20} alt={form.types[i]} key={i}/>)
		}

		art_src = Data.pokemonArtURL(form.art);
		art_alt = form.name;
	}

	const art = <Image src={art_src} width={size} height={size} alt={art_alt} />;

	return (
		<div className="panel p-4 flex flex-col items-center anim-pulse" onClick={() => {props.onClick(props.id, props.form)}}>
			<div className="text-center min-h-6">{props.id > 0 ? form.name : ""}</div>
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
		<div className="panel p-1 min-w-[96px] min-h-[96px] relative" onClick={() => {props.onClick(props.id, props.form)}}>
			<Image src={Data.imageURL("poke-ball.png")} width={24} height={24} alt="selected" className={"left-1 top-1 absolute fade" + hidden} />
			<Image src={Data.pokemonSpriteURL(form.sprite)} width={size} height={size} alt={form.name} />
		</div>
	);
}