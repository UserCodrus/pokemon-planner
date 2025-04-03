import Pokemon from "../data/pokemon.json";
import Types from "../data/types.json";

// String representations of image folders
const image_ext = ".png";
const type_sprite_location = "/images/types/";
const type_icon_location = "/images/types/icons/";
const pokemon_art_location = "/images/pokemon/art/";
const pokemon_sprite_location = "/images/pokemon/sprites/";
const misc_location = "/images/";

// Data type for pokemon data
export type PokemonData = {
	id: number,
	name: string,
	type: number[]
}

export type TypeData = {
	name: string,
	damage: number[]
}

// A 1x1px transparent gif to use as a placeholder
export const default_image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// A full list of type ids for pokemon types
export const types = [
	"normal",
	"fighting",
	"flying",
	"poison",
	"ground",
	"rock",
	"bug",
	"ghost",
	"steel",
	"fire",
	"water",
	"grass",
	"electric",
	"psychic",
	"ice",
	"dragon",
	"dark",
	"fairy"
];

/**
 * Get the URL for a pokemon's artwork image
 * @param id The id of the pokemon
 */
export function pokemonArtURL(filename: string)
{
	return pokemon_art_location + filename;
}

/**
 * Get the URL for a pokemon's sprite image
 * @param id The id of the pokemon
 */
export function pokemonSpriteURL(filename: string)
{
	return pokemon_sprite_location + filename;
}

/**
 * Get the URL for a type sprite
 * @param type The name of the type
 */
export function typeSpriteURL(type: number)
{
	return type_sprite_location + (type + 1).toString() + image_ext;
}

/**
 * Get the URL for a type icon
 * @param type The name of the type
 */
export function typeIconURL(type: number)
{
	return type_icon_location + (type + 1).toString() + image_ext;
}

/**
 * Get the URL for an image
 * @param type The name of the image file
 */
export function imageURL(filename: string)
{
	return misc_location + filename;
}

/**
 * Retrieve data for a given pokemon
 * @param id The pokemon's national dex id
 * @param form The name of the pokemon's form
 */
export function getPokemon(id: number, form?: string): PokemonData
{
	const pokemon = Pokemon[id];
	
	// Determine which form the pokemon should use
	let selected_form = pokemon.forms[0];
	if (form)
	{
		for (const pokemon_form of pokemon.forms)
		{
			if (pokemon_form.form === form)
			{
				selected_form = pokemon_form;
				break;
			}
		}
	}

	return {
		id: id,
		name: selected_form.name,
		type: selected_form.types as number[]
	}
}

/**
 * Retrieve data about a pokemon type
 * @param id The id number of the type
 * @returns A TypeData object containing information about the type
 */
export function getType(id: number): TypeData
{
	if (id < Types.length)
	{
		return {
			name: Types[id].name,
			damage: Types[id].damage[0].multiplier
		};
	}

	return {
		name: Types[0].name,
		damage: Types[0].damage[0].multiplier
	};
}