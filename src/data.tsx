import Pokemon from "../data/pokemon.json";
import Types from "../data/types.json";

// String representations of image folders
const image_ext = ".png";
const type_sprite_location = "/images/types/";
const type_icon_location = "/images/types/icons/";
const pokemon_art_location = "/images/pokemon/art/";
const pokemon_sprite_location = "/images/pokemon/sprites/";
const misc_location = "/images/";

export const party_size = 6;

// Data type for pokemon data
export type PokemonData = {
	id: number,
	name: string,
	types: number[],

	sprite: string,
	art: string
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
export function getPokemon(generation: number, id: number, form?: string): PokemonData
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

	// Determine which types the pokemon should use based on the currently selected generation
	let current_type = {
		generation: 0,
		types: [0]
	};
	for (let i = 0; i < selected_form.types.length; ++i)
	{
		if (selected_form.types[i].generation >= generation)
		{
			current_type = selected_form.types[i];
			break;
		}
	}

	return {
		id: id,
		name: selected_form.name,
		types: current_type.types,
		sprite: pokemon_sprite_location + selected_form.sprite,
		art: pokemon_art_location + selected_form.art
	}
}

export function getNumTypes(): number
{
	return Types.length;
}

export function getTypeName(id: number): string
{
	if (id < Types.length)
	{
		return Types[id].name;
	}

	return "unknown";
}

export function getTypeAdvantage(offensive_type: number, defensive_type: number): number
{
	return Types[offensive_type].damage[Types[offensive_type].damage.length-1].multiplier[defensive_type];
}