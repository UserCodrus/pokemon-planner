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

	// Create images for the type displays and artwork, with fallbacks for empty party slots
	const images: ReactElement[] = [];
	let art: ReactElement;
	if (props.id > 0)
	{
		for (const type of form.types)
		{
			const src = Data.typeSpriteURL(type);
			images.push(<Image className="inline-flex" src={src} width={100} height={20} alt={type} />)
		}

		art = <Image src={Data.pokemonArtURL(pokemon.id)} width={128} height={128} alt={pokemon.name} />;
	}
	else
	{
		art = <div className="inline-block min-w-[128px] min-h-[128px]"></div>
	}

	return (
		<div className="bg-panel p-4 rounded-lg flex-col inline-flex items-center">
			<div className="text-center">{props.id > 0 ? form.name : "Empty"}</div>
			{art}
			<div className="inline-flex flex-col min-h-[40px] min-w-[100px] justify-center">
				{images}
			</div>
		</div>
	);
}