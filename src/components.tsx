'use client';

import { ReactElement } from "react";
import Image from 'next/image'

import * as Data from "./data";

/**
 * A component that displays a pokemon the user has selected for their party
 * @param props.pokemon The pokemon that will be displayed in the panel
 * @returns A react component
 */
export function PartyMember(props: {pokemon: Data.Pokemon}): ReactElement
{
	const image_url = Data.pokemonArtURL(props.pokemon.id);
	const type1 = Data.typeSpriteURL(props.pokemon.type[0]);
	const type2 = props.pokemon.type[1] ? Data.typeSpriteURL(props.pokemon.type[1]) : "";

	return (
		<div className="bg-panel p-4 rounded-lg flex-col inline-flex items-center">
			<div className="text-center">{props.pokemon.name}</div>
			<Image src={image_url} width={128} height={128} alt={props.pokemon.name} />
			<Image className="inline-flex" src={type1} width={100} height={20} alt={props.pokemon.type[0]} />
			<Image className="inline-flex" src={type2} width={100} height={20} alt={props.pokemon.type[1]} />
		</div>
	);
}