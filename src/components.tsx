'use client';

import { ReactElement } from "react";
import Image from 'next/image'

import * as Data from "./data";
import Pokedex from "../data/pokedex.json";
import Pokemon from "../data/pokemon.json";

/**
 * A component that displays a pokemon the user has selected for their party
 * @param props.id The national dex id of the pokemon that the panel will display
 * @param props.form The id of the form that the pokemon will use
 */
export function PartyMember(props: {id: number, form?: number}): ReactElement
{
	const size = 128;

	const pokemon = Pokemon[props.id];
	const form = pokemon.forms[props.form ? props.form : 0];

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
		<div className="bg-panel p-4 rounded-lg flex-col inline-flex items-center">
			<div className="text-center">{props.id > 0 ? form.name : "Empty"}</div>
			{art}
			<div className="inline-flex flex-col min-h-[40px] min-w-[100px] justify-center">
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
export function PokemonSelector(props: {id: number, form?: number}): ReactElement
{
	const size = 64;

	const pokemon = Pokemon[props.id];
	const form = pokemon.forms[props.form ? props.form : 0];

	return (
		<div className="bg-panel p-1 rounded-lg inline-flex" >
			<Image src={Data.pokemonSpriteURL(form.sprite)} width={size} height={size} alt={form.name} />
		</div>
	);
}