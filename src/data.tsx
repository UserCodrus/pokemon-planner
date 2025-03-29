// String representations of image folders
const image_ext = ".png";
const type_sprite_location = "/images/types/";
const type_icon_location = "/images/types/icons/";
const pokemon_art_location = "/images/pokemon/art/";
const pokemon_sprite_location = "/images/pokemon/sprites/";
const misc_location = "/images/";

// Data type for pokemon data
export type Pokemon = {
	id: number,
	name: string,
	type: string[]
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
export function typeSpriteURL(type: string)
{
	return type_sprite_location + type + image_ext;
}

/**
 * Get the URL for a type icon
 * @param type The name of the type
 */
export function typeIconURL(type: string)
{
	return type_icon_location + type + image_ext;
}

/**
 * Get the URL for an image
 * @param type The name of the image file
 */
export function imageURL(filename: string)
{
	return misc_location + filename;
}