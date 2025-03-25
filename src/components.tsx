'use client';

import { ReactElement } from "react";
import Image from 'next/image'

import * as Data from "./data";
import Pokedex from "../data/pokedex.json";
import Pokemon from "../data/pokemon.json";

/**
 * A component that displays a pokemon the user has selected for their party
 * @param props.pokemon The pokemon that will be displayed in the panel
 * @augments
 * @returns A react component
 */
export function PartyMember(props: {id: number, form?: number}): ReactElement
{
	const pokemon = Pokemon[props.id];
	const form = pokemon.forms[props.form ? props.form : 0];

	const image_url = Data.pokemonArtURL(pokemon.id);

	// Create images for the type displays
	const images: ReactElement[] = [];
	for (const type of form.types)
	{
		const src = Data.typeSpriteURL(type);
		images.push(<Image className="inline-flex" src={src} width={100} height={20} alt={type} />)
	}

	return (
		<div className="bg-panel p-4 rounded-lg flex-col inline-flex items-center">
			<div className="text-center">{form.name}</div>
			<Image src={image_url} width={128} height={128} alt={pokemon.name} />
			<div className="inline-flex flex-col min-h-[40px] justify-center">
				{images}
			</div>
		</div>
	);
}